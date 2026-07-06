from typing import Any, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.database.session import SessionLocal
from src.models.notification import Notification, NotificationType
from src.schemas.notification import NotificationResponse, PaginatedNotifications
from src.utils.service import manager as websocket_manager
from src.utils.presence import presence_manager
import logging

logger = logging.getLogger(__name__)

def get_notifications(db: Session, user_id: int, cursor: Optional[str] = None, limit: int = 20, unread_only: bool = False, notif_type: Optional[NotificationType] = None) -> PaginatedNotifications:
    query = db.query(Notification).filter(Notification.recipient_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    if notif_type:
        query = query.filter(Notification.notification_type == notif_type)
    
    if cursor:
        cursor_date = datetime.fromisoformat(cursor)
        query = query.filter(Notification.created_at < cursor_date)
        
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    records = query.all()
    
    items = [NotificationResponse.model_validate(r) for r in records]
    next_cursor = items[-1].created_at.isoformat() if len(items) == limit else None
    
    return PaginatedNotifications(items=items, next_cursor=next_cursor)

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read == False).count()

def mark_as_read(db: Session, user_id: int, notification_id: int) -> bool:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.recipient_id == user_id).first()
    if not notif:
        return False
    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    return True

def mark_all_as_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read == False).update(
        {"is_read": True, "read_at": datetime.utcnow()}, synchronize_session=False
    )
    db.commit()

def delete_notification(db: Session, user_id: int, notification_id: int) -> bool:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.recipient_id == user_id).first()
    if not notif:
        return False
    db.delete(notif)
    db.commit()
    return True

async def create_and_dispatch_notification(
    recipient_id: int, 
    notification_type: NotificationType,
    title: str,
    message: str,
    actor_id: Optional[int] = None,
    metadata_: Optional[Dict[str, Any]] = None
):
    # Presence check for messaging
    if notification_type == NotificationType.MESSAGE_RECEIVED:
        presence = presence_manager.get_presence(recipient_id)
        if presence.get("page") == "messages" and presence.get("conversation_id") == metadata_.get("conversation_id"):
            logger.info(f"Skipping notification for user {recipient_id}, active in conversation.")
            return

    db = SessionLocal()
    try:
        notif = Notification(
            recipient_id=recipient_id,
            actor_id=actor_id,
            notification_type=notification_type,
            title=title,
            message=message,
            metadata_=metadata_
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # Dispatch via WebSocket if online
        payload = {
            "type": "notification",
            "payload": NotificationResponse.model_validate(notif).model_dump(mode="json")
        }
        await websocket_manager.send_private_json(recipient_id, payload)
    finally:
        db.close()

def handle_notification_event(event_data: Dict[str, Any]):
    """
    Called by EventBus synchronously. Since websocket dispatch is async,
    we create a background task using asyncio if there's a running loop,
    or we can dispatch it asynchronously.
    """
    import asyncio
    
    async def task():
        await create_and_dispatch_notification(
            recipient_id=event_data["recipient_id"],
            notification_type=event_data["notification_type"],
            title=event_data["title"],
            message=event_data["message"],
            actor_id=event_data.get("actor_id"),
            metadata_=event_data.get("metadata_")
        )
        
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(task())
    except RuntimeError:
        asyncio.run(task())
