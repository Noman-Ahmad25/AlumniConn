from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload

from fastapi import UploadFile
from src.services.cloudinary_service import upload_image

from src.models.connection import Connection, ConnectionStatus
from src.models.profile import Profile
from src.schemas.profile import ProfileCreate, ProfileUpdate
from src.models.user import User

PROFILE_FIELDS = (
    "full_name",
    "profile_picture",
    "bio",
    "company",
    "job_title",
    "job_industry",
    "job_description",
    "location",
    "skills",
    "interests",
    "major",
    "grad_year",
)


def get_profile_connection_status(db: Session, viewed_user: User, current_user: User) -> str:
    if viewed_user.id == current_user.id:
        return "self"

    connection = db.query(Connection).filter(
        Connection.college_id == current_user.college_id,
        or_(
            and_(
                Connection.sender_id == current_user.id,
                Connection.receiver_id == viewed_user.id,
            ),
            and_(
                Connection.sender_id == viewed_user.id,
                Connection.receiver_id == current_user.id,
            ),
        ),
    ).first()

    if not connection or connection.status == ConnectionStatus.REJECTED:
        return "none"
    if connection.status == ConnectionStatus.ACCEPTED:
        return "connected"
    return "pending"


def format_profile(profile: Profile, user: User, connection_status: str = "self") -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "username": user.username,
        "connection_status": connection_status,
        "full_name": profile.full_name,
        "profile_picture": profile.profile_picture,
        "bio": profile.bio,
        "company": profile.company,
        "job_title": profile.job_title,
        "job_industry": profile.job_industry,
        "job_description": profile.job_description,
        "location": profile.location,
        "skills": profile.skills,
        "interests": profile.interests,
        "major": profile.major,
        "grad_year": profile.grad_year,
    }


def _get_user_with_profile(db: Session, user_id: int, college_id: int) -> User | None:
    return db.query(User).options(joinedload(User.profile)).filter(
        User.id == user_id,
        User.college_id == college_id,
    ).first()


def ensure_profile_exists(db: Session, user: User) -> Profile:
    db_profile = user.profile

    if not db_profile:
        db_profile = Profile(
            user_id=user.id,
            college_id=user.college_id,
            full_name=user.username,
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        user.profile = db_profile

    return db_profile


def _apply_profile_update(db_profile: Profile, data: dict) -> None:
    for field, value in data.items():
        if field in PROFILE_FIELDS:
            setattr(db_profile, field, value)


def create_profile(db: Session, profile: ProfileCreate, current_user: User, task_dispatcher: AbstractTaskDispatcher) -> dict | None:
    user = _get_user_with_profile(db, current_user.id, current_user.college_id)
    if not user:
        return None

    db_profile = ensure_profile_exists(db, user)
    _apply_profile_update(db_profile, profile.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(db_profile)
    
    task_dispatcher.dispatch(trigger_embedding_generation, db, current_user.id)
    return format_profile(db_profile, user, "self")


from fastapi import UploadFile
from src.services.recommendation_service import trigger_embedding_generation
from src.utils.dispatcher import AbstractTaskDispatcher

def update_profile(
    db: Session, 
    profile_data: ProfileUpdate, 
    current_user: User, 
    task_dispatcher: AbstractTaskDispatcher,
    image_file: UploadFile | None = None
) -> dict | None:
    user = _get_user_with_profile(db, current_user.id, current_user.college_id)
    if not user:
        return None

    db_profile = ensure_profile_exists(db, user)
    
    # 1. Convert schema to dict
    update_data = profile_data.model_dump(exclude_unset=True)
    
    # 2. If a file was uploaded, send to Cloudinary and update the dict
    if image_file:
        cloud_url = upload_image(image_file, folder="alumniconn/profiles")
        if cloud_url:
            update_data["profile_picture"] = cloud_url

    # 3. Apply updates to the DB model
    _apply_profile_update(db_profile, update_data)
    
    db.commit()
    db.refresh(db_profile)
    
    # Trigger semantic embedding update in background
    task_dispatcher.dispatch(trigger_embedding_generation, db, current_user.id)
    
    return format_profile(db_profile, user, "self")


def get_my_profile(db: Session, current_user: User) -> dict | None:
    user = _get_user_with_profile(db, current_user.id, current_user.college_id)
    if not user:
        return None

    db_profile = ensure_profile_exists(db, user)
    return format_profile(db_profile, user, "self")


def get_other_profile(db: Session, target_user_id: int, current_user: User) -> dict | None:
    user = _get_user_with_profile(db, target_user_id, current_user.college_id)
    if not user:
        return None

    db_profile = ensure_profile_exists(db, user)
    connection_status = get_profile_connection_status(db, user, current_user)
    return format_profile(db_profile, user, connection_status)
