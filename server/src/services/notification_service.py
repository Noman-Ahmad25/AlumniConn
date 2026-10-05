import asyncio
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

def persist_notification(
    recipient_id: int, 
    notification_type: NotificationType,
    title: str,
    message: str,
    actor_id: Optional[int] = None,
    metadata_: Optional[Dict[str, Any]] = None
) -> Optional[Notification]:
    # Presence check for messaging
    if notification_type == NotificationType.MESSAGE_RECEIVED and metadata_:
        presence = presence_manager.get_presence(recipient_id)
        if presence.get("page") == "messages" and presence.get("conversation_id") == metadata_.get("conversation_id"):
            logger.info("Skipping notification for user, active in conversation.", extra={"recipient_id": recipient_id})
            return None

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
        return notif
    except Exception as e:
        db.rollback()
        logger.exception("Failed to persist notification in database", exc_info=e)
        return None
    finally:
        db.close()


def _log_notification_task_error(t: asyncio.Task) -> None:
    if t.cancelled():
        return
    if t.exception():
        logger.exception("Error executing async notification task", exc_info=t.exception())


def handle_notification_event(event_data: Dict[str, Any]):
    """
    Called by EventBus synchronously after db.commit().
    Persists the notification record synchronously to ensure database persistence,
    then dispatches the real-time notification frame via WebSocket if the user is online.
    """
    try:
        notif = persist_notification(
            recipient_id=event_data["recipient_id"],
            notification_type=event_data["notification_type"],
            title=event_data["title"],
            message=event_data["message"],
            actor_id=event_data.get("actor_id"),
            metadata_=event_data.get("metadata_")
        )
        if not notif:
            return

        recipient_id = event_data["recipient_id"]
        # Only dispatch WebSocket payload if recipient is currently connected
        if recipient_id in websocket_manager.active_connections:
            payload = {
                "type": "notification",
                "payload": NotificationResponse.model_validate(notif).model_dump(mode="json")
            }
            try:
                loop = asyncio.get_running_loop()
                t = loop.create_task(websocket_manager.send_private_json(recipient_id, payload))
                t.add_done_callback(_log_notification_task_error)
            except RuntimeError:
                pass
    except Exception as e:
        logger.exception("Error handling notification event", exc_info=e)

