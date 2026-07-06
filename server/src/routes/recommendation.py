from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from src.database.session import get_db
from src.utils.dependency import get_current_user
from src.models.user import User
from src.schemas.recommendation import PaginatedRecommendations
from src.services.recommendation_service import get_recommendations

router = APIRouter()

@router.get("", response_model=PaginatedRecommendations)
def get_all_recommendations(
    cursor: Optional[float] = Query(None, description="Cursor for pagination based on match_score"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get generic personalized recommendations (alumni and mentors).
    """
    items, next_cursor = get_recommendations(db, current_user, cursor=cursor, limit=limit)
    return PaginatedRecommendations(items=items, next_cursor=next_cursor)

@router.get("/mentors", response_model=PaginatedRecommendations)
def get_mentor_recommendations(
    cursor: Optional[float] = Query(None, description="Cursor for pagination based on match_score"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized mentor recommendations (users with ALUMNI or ADMIN role).
    """
    items, next_cursor = get_recommendations(db, current_user, cursor=cursor, limit=limit, role_filter="mentors")
    return PaginatedRecommendations(items=items, next_cursor=next_cursor)

@router.get("/alumni", response_model=PaginatedRecommendations)
def get_alumni_recommendations(
    cursor: Optional[float] = Query(None, description="Cursor for pagination based on match_score"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized alumni recommendations.
    """
    items, next_cursor = get_recommendations(db, current_user, cursor=cursor, limit=limit, role_filter="alumni")
    return PaginatedRecommendations(items=items, next_cursor=next_cursor)
