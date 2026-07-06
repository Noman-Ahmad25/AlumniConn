from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from src.models.notification import NotificationType

class NotificationBase(BaseModel):
    notification_type: NotificationType
    title: str
    message: str
    metadata_: Optional[dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    recipient_id: int
    actor_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PaginatedNotifications(BaseModel):
    items: list[NotificationResponse]
    next_cursor: Optional[str] = None
