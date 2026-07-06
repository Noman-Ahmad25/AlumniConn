from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from src.database.session import get_db
from src.utils.dependency import get_current_user
from src.models.user import User
from src.models.notification import NotificationType
from src.schemas.notification import PaginatedNotifications, NotificationResponse
from src.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
    delete_notification
)

router = APIRouter()

@router.get("", response_model=PaginatedNotifications)
def api_get_notifications(
    cursor: Optional[str] = Query(None, description="ISO timestamp cursor"),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = Query(False),
    notif_type: Optional[NotificationType] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_notifications(db, current_user.id, cursor, limit, unread_only, notif_type)

@router.get("/unread-count", response_model=dict)
def api_get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def api_mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = mark_as_read(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None

@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def api_mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mark_all_as_read(db, current_user.id)
    return None

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def api_delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = delete_notification(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None
