from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.services.like_service import toggle_like
from src.schemas.like import LikeResponse
from src.utils.dependency import get_current_user
from src.database.session import get_db

from src.models.user import User

router = APIRouter()

@router.post("/toggle/{post_id}", response_model=LikeResponse)
def toggle_like_endpoint(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        like = toggle_like(db, current_user, post_id)
        if like is None:
            return LikeResponse(liked=False, post_id=post_id)  # Indicate like was removed
        return LikeResponse(liked=True, post_id=post_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))