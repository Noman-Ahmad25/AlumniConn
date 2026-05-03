from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship, foreign
from datetime import datetime
from src.database import Base
import enum


class CollegeRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class CollegeRequest(Base):
    __tablename__ = "college_requests"

    id = Column(Integer, primary_key=True, index=True)
    
    # College details
    name = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True)
    established_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    admin_name = Column(String, nullable=False)
    admin_email = Column(String, nullable=False, index=True)
    
    # Request metadata
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(Enum(CollegeRequestStatus), default=CollegeRequestStatus.PENDING, index=True)
    
    # Decision tracking
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # College link (set when approved)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requested_by], backref="college_requests_created")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    college = relationship("College", backref="college_requests")
