from sqlalchemy.exc import IntegrityError

from src.models.user import User
from src.models.user import UserRole
from src.models.profile import Profile
from src.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)


def _token_for_user(user: User) -> str:
    token_payload = {
        "user_id": user.id,
        "college_id": user.college_id,
        "role": user.role.value,
    }
    return create_access_token(token_payload)


def register_user(db, user_data):
    # Check for existing email
    existing_email = db.query(User).filter(
        User.email == user_data.email,
        User.college_id == user_data.college_id,
    ).first()
    if existing_email:
        return "email_exists"

    # Check for existing username
    existing_username = db.query(User).filter(
        User.username == user_data.username,
        User.college_id == user_data.college_id,
    ).first()
    if existing_username:
        return "username_exists"

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        college_id=user_data.college_id,
        role=UserRole(user_data.role.value),
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
    user = db.query(User).filter(
        User.email == user_data.email,
        User.college_id == user_data.college_id,
    ).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if user.role == UserRole.SUPER_ADMIN:
        return "super_admin_login_required"

    # Check if college is approved
    if not user.college.is_approved:
        return "college_not_approved"

    if not user.is_active:
        return "inactive"
    return _token_for_user(user)


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


# Activation system removed - all users must belong to an approved college
