import enum
from sqlalchemy import Column, BigInteger, Integer, String, Boolean, DateTime, ForeignKey, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from src.database.base import Base

class NotificationType(str, enum.Enum):
    CONNECTION_RECEIVED = "connection_received"
    CONNECTION_ACCEPTED = "connection_accepted"
    CONNECTION_REJECTED = "connection_rejected"
    MESSAGE_RECEIVED = "message_received"
    POST_LIKED = "post_liked"
    POST_COMMENTED = "post_commented"
    ALUMNI_REQUEST_APPROVED = "alumni_request_approved"
    ALUMNI_REQUEST_REJECTED = "alumni_request_rejected"
    COLLEGE_REQUEST_APPROVED = "college_request_approved"
    COLLEGE_REQUEST_REJECTED = "college_request_rejected"
    RECOMMENDATIONS_AVAILABLE = "recommendations_available"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    metadata_ = Column("metadata", JSONB, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_notifications_recipient_created', 'recipient_id', 'created_at'),
        Index('idx_notifications_recipient_unread', 'recipient_id', 'is_read'),
    )
