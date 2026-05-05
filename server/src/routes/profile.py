from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session

from src.models.user import User
from src.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from src.utils.dependency import get_current_user
from src.database.session import get_db

from src.services.profile_service import create_profile, get_my_profile, get_other_profile, update_profile

router = APIRouter()

@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = create_profile(db, profile, current_user)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return result


@router.put("/me", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
@router.patch("/me", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def api_update_profile(
    full_name: str | None = Form(None),
    bio: str | None = Form(None),
    company: str | None = Form(None),
    job_title: str | None = Form(None),
    location: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile_data = ProfileUpdate(
        full_name=full_name,
        bio=bio,
        company=company,
        job_title=job_title,
        location=location
    )
    return update_profile(db, profile_data, current_user, image_file=file)

@router.get("/me", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_my_profile(db, current_user)

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return profile

@router.get("/{target_user_id}", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
def get_specific_user_profile(
    target_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_other_profile(db, target_user_id, current_user)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or does not belong to your college"
        )

    return profile
