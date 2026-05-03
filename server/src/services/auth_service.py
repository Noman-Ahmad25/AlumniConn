from datetime import datetime

from sqlalchemy.exc import IntegrityError

from src.models.user import User
from src.models.user import UserRole
from src.models.profile import Profile
from src.utils.security import (
    create_access_token,
    hash_activation_token,
    hash_password,
    verify_password,
)


def register_user(db, user_data):
    # Check for existing email
    existing_email = db.query(User).filter(User.email == user_data.email, User.college_id == user_data.college_id).first()
    if existing_email:
        return "email_exists"

    # Check for existing username
    existing_username = db.query(User).filter(User.username == user_data.username, User.college_id == user_data.college_id).first()
    if existing_username:
        return "username_exists"

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        college_id=user_data.college_id,
        role=user_data.role,  # Already a UserRole enum
        is_active=True,
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
        return new_user
    except IntegrityError:
        db.rollback()
        return "db_error"
    except Exception:
        db.rollback()
        return "db_error"


def login_user(db, user_data):
    user = db.query(User).filter(User.email == user_data.email, User.college_id == user_data.college_id).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if user.role == UserRole.SUPER_ADMIN:
        return "super_admin_login_required"

    if not user.is_active:
        return "inactive"
    token_payload = {
        "user_id": user.id,
        "college_id": user.college_id,
        "role": user.role.value
        }
    return create_access_token(token_payload)


def login_super_admin(db, user_data):
    user = db.query(User).filter(
        User.email == user_data.email,
        User.role == UserRole.SUPER_ADMIN,
    ).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if not user.is_active:
        return "inactive"

    token_payload = {
        "user_id": user.id,
        "college_id": user.college_id,
        "role": user.role.value
    }
    return create_access_token(token_payload)


def verify_activation_token(db, token: str):
    token_hash = hash_activation_token(token)
    user = db.query(User).filter(User.activation_token_hash == token_hash).first()
    if not user:
        return "invalid"
    if user.activation_token_expires_at and user.activation_token_expires_at < datetime.utcnow():
        return "expired"
    return "valid"


def activate_user(db, activation_data):
    token_hash = hash_activation_token(activation_data.token)
    user = db.query(User).filter(User.activation_token_hash == token_hash).first()
    if not user:
        return "invalid"

    if user.activation_token_expires_at and user.activation_token_expires_at < datetime.utcnow():
        user.activation_token_hash = None
        user.activation_token_expires_at = None
        db.commit()
        return "expired"

    user.password_hash = hash_password(activation_data.password)
    user.is_active = True
    user.activation_token_hash = None
    user.activation_token_expires_at = None
    db.commit()
    db.refresh(user)
    return user
