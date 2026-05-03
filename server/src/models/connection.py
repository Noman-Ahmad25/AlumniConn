from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
 
from src.database import Base
 
 
class ConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
 
 
class Connection(Base):
    __tablename__ = "connections"
    __table_args__ = (
        UniqueConstraint('sender_id', 'receiver_id', 'college_id', name='unique_connection'),
        CheckConstraint('sender_id != receiver_id', name='no_self_connection'),
    )
 
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    receiver_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
 
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_connections")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_connections")
    college = relationship("College", back_populates="connections")  # Fix: College now has `connections`
 