from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError  # FIX: was used but never imported
from ..models.user import User, UserRole
from ..schemas.user import UserCreate
from ..utils.security import create_access_token, hash_password, verify_password


def register_user(db: Session, user_data: UserCreate):
    existing_email = db.query(User).filter(
        User.email == user_data.email,
        User.college_id == user_data.college_id,
    ).first()
    if existing_email:
        return "email_exists"

    existing_username = db.query(User).filter(
        User.username == user_data.username,
        User.college_id == user_data.college_id,
    ).first()
    if existing_username:
        return "username_exists"

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        college_id=user_data.college_id,
        role=user_data.role,
        is_active=True,
    )

    try:
        db.add(new_user)
        db.flush()
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        return "db_error"
    except Exception:
        db.rollback()
        return "db_error"


def login_user(db: Session, user_data):
    if not user_data.college_id:
        return "college_id_required"

    user = db.query(User).filter(
        User.email == user_data.email,
        User.college_id == user_data.college_id,
    ).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if user.role == UserRole.SUPER_ADMIN:
        return "use_admin_login"

    if not user.is_active:
        return "inactive"

    token_payload = {
        "user_id": user.id,
        "college_id": user.college_id,
        "role": user.role.value,
    }
    return create_access_token(token_payload)


def login_super_admin(db: Session, user_data):
    user = db.query(User).filter(
        User.email == user_data.email,
        User.role == UserRole.SUPER_ADMIN,
        User.college_id == None,
    ).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        return None

    if not user.is_active:
        return "inactive"

    token_payload = {
        "user_id": user.id,
        "college_id": None,
        "role": user.role.value,
    }
    return create_access_token(token_payload)