from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database import Base
import enum


class AlumniRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AlumniRequest(Base):
    __tablename__ = "alumni_requests"

    id = Column(Integer, primary_key=True, index=True)
    
    # Request details
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False, index=True)
    
    # Status tracking
    status = Column(Enum(AlumniRequestStatus), default=AlumniRequestStatus.PENDING, index=True)
    
    # Decision tracking
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="alumni_requests")
    college = relationship("College")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    
    __table_args__ = (
        UniqueConstraint('user_id', 'college_id', name='unique_user_college_alumni_request'),
    )
