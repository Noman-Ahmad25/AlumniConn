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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_discover_users(db=db, current_user=current_user)
