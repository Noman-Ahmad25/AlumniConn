from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from datetime import datetime, timedelta

from src.models.user import User
from src.models.user import UserRole
from src.models.profile import Profile
from src.models.college import College
from src.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from src.utils.tokens import generate_verification_token, hash_token, verify_token
from src.utils.dispatcher import AbstractTaskDispatcher
from src.services.email.service import EmailService
from src.utils.event_bus import event_bus


def _token_for_user(user: User) -> str:
    token_payload = {
        "user_id": user.id,
        "college_id": user.college_id,
        "role": user.role.value,
    }
    return create_access_token(token_payload)


def register_user(db, user_data, task_dispatcher: AbstractTaskDispatcher):
    college = db.query(College).filter(College.slug == user_data.college_slug).first()
    if not college:
        return "college_not_found"

    # Check for existing email
    existing_email = db.query(User).filter(
        User.email == user_data.email,
        User.college_id == college.id,
    ).first()
    if existing_email:
        return "email_exists"

    # Check for existing username
    existing_username = db.query(User).filter(
        User.username == user_data.username,
        User.college_id == college.id,
    ).first()
    if existing_username:
        return "username_exists"

    raw_token = generate_verification_token()
    token_hash = hash_token(raw_token)
    expires_at = datetime.utcnow() + timedelta(hours=24)

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        college_id=college.id,
        role=UserRole(user_data.role.value),
        is_active=True,
        email_verified=False,
        verification_token_hash=token_hash,
        verification_token_expires_at=expires_at
    )

    try:
        db.add(new_user)
        db.flush()
        db.add(Profile(
            user_id=new_user.id,
            college_id=new_user.college_id,
            full_name=new_user.username,
        ))
        db.commit()
        db.refresh(new_user)
        
        # Dispatch email task
        task_dispatcher.dispatch(EmailService.send_user_verification, new_user.email, raw_token, new_user.username)
        
        return new_user
    except IntegrityError:
        db.rollback()
        return "db_error"
    except Exception:
        db.rollback()
        return "db_error"


def login_user(db, user_data):
    college = db.query(College).filter(College.slug == user_data.college_slug).first()
    if not college:
        return None

    # Lookup by username OR email within the college
    user = db.query(User).filter(
        or_(
            User.email == user_data.username_or_email,
            User.username == user_data.username_or_email
        ),
        User.college_id == college.id,
    ).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if user.role == UserRole.SUPER_ADMIN:
        return "super_admin_login_required"

    if not user.email_verified:
        return "email_not_verified"

    # Check if college is approved
    if not user.college.is_approved:
        return "college_not_approved"

    if not user.is_active:
        return "inactive"
        
    return _token_for_user(user)


def forgot_password(db, forgot_data, task_dispatcher: AbstractTaskDispatcher):
    college = db.query(College).filter(College.slug == forgot_data.college_slug).first()
    if not college:
        return False
        
    user = db.query(User).filter(
        or_(
            User.email == forgot_data.username_or_email,
            User.username == forgot_data.username_or_email
        ),
        User.college_id == college.id,
    ).first()
    
    if not user:
        return False # generic success on frontend
        
    raw_token = generate_verification_token()
    user.password_reset_token_hash = hash_token(raw_token)
    user.password_reset_expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    
    task_dispatcher.dispatch(EmailService.send_password_reset, user.email, raw_token, user.username, college.slug)
    return True


def reset_password(db, reset_data):
    hashed = hash_token(reset_data.token)
    user = db.query(User).filter(User.password_reset_token_hash == hashed).first()
    
    if not user:
        return False
        
    if user.password_reset_expires_at and user.password_reset_expires_at < datetime.utcnow():
        return False
        
    user.password_hash = hash_password(reset_data.new_password)
    user.password_reset_token_hash = None
    user.password_reset_expires_at = None
    
    db.commit()
    return True


def login_super_admin(db, user_data):
    user = db.query(User).filter(
        User.email == user_data.email,
        User.role == UserRole.SUPER_ADMIN,
    ).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if not user.is_active:
        return "inactive"

    return _token_for_user(user)


def verify_user_email(db, token: str) -> bool:
    hashed = hash_token(token)
    user = db.query(User).filter(User.verification_token_hash == hashed).first()
    
    if not user:
        return False
        
    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.utcnow():
        return False
        
    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    user.verification_token_hash = None
    user.verification_token_expires_at = None
    
    db.commit()
    
    event_bus.publish("user_email_verified", {
        "user_id": user.id,
        "email": user.email
    })
    
    return True


def resend_user_verification(db, user_id: int, task_dispatcher: AbstractTaskDispatcher) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.email_verified:
        return False
        
    raw_token = generate_verification_token()
    user.verification_token_hash = hash_token(raw_token)
    user.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    
    db.commit()
    
    task_dispatcher.dispatch(EmailService.send_user_verification, user.email, raw_token, user.username)
    return True
