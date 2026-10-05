from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.models.user import User
from src.schemas.user import DiscoverUserResponse
from src.services.user_service import get_discover_users
from src.utils.dependency import get_current_user

router = APIRouter()


@router.get("/discover", response_model=list[DiscoverUserResponse])
def discover_users(
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    major: str | None = None,
    grad_year: int | None = None,
    company: str | None = None,
    location: str | None = None,
    skill: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_discover_users(
        db=db,
        current_user=current_user,
        skip=skip,
        limit=limit,
        search=search,
        major=major,
        grad_year=grad_year,
        company=company,
        location=location,
        skill=skill,
    )
