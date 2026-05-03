from fastapi import APIRouter, Depends, HTTPException, status
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
def update_user_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_profile = update_profile(db, profile, current_user)

    if not updated_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return updated_profile

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
