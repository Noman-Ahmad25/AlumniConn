from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from datetime import datetime
 
from src.database import Base
import enum
 
 
# Role Enum
class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    ALUMNI = "alumni"
    STUDENT = "student"

class AlumniStatus(str, enum.Enum):
    NOT_REQUESTED = "not_requested"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
 
 
class User(Base):
    __tablename__ = "users"
 
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
 
    # Basic Info
    username = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
 
    # Auth
    password_hash = Column(String, nullable=False)
    password_reset_token_hash = Column(String, nullable=True, unique=True, index=True)
    password_reset_expires_at = Column(DateTime, nullable=True)
    
    email_verified = Column(Boolean, default=False, nullable=False, index=True)
    email_verified_at = Column(DateTime, nullable=True)
    verification_token_hash = Column(String, nullable=True, unique=True, index=True)
    verification_token_expires_at = Column(DateTime, nullable=True)
 
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True)
 
    # Role
    role = Column(
        Enum(
            UserRole,
            name="userrole",
            native_enum=True,
            validate_strings=True,
        ),
        default=UserRole.STUDENT,
        nullable=False,
    )
 
    # Status
    is_active = Column(Boolean, default=True)

    # Alumni Request State
    alumni_status = Column(Enum(AlumniStatus), default=AlumniStatus.NOT_REQUESTED, nullable=False, index=True)
    alumni_requested_at = Column(DateTime, nullable=True)
    alumni_reviewed_at = Column(DateTime, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes = Column(String, nullable=True)
 
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
 
    # Relationships
    college = relationship("College", back_populates="users")
    profile = relationship("Profile", back_populates="user", uselist=False)
    posts = relationship("Post", back_populates="user", cascade="all, delete")
    
    messages = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
    )
    sent_connections = relationship(
        "Connection",
        foreign_keys="Connection.sender_id",
        back_populates="sender",
        cascade="all, delete",
    )
    received_connections = relationship(
        "Connection",
        foreign_keys="Connection.receiver_id",
        back_populates="receiver",
        cascade="all, delete",
    )
    
    reviewed_by = relationship(
        "User",
        remote_side=[id],
        foreign_keys=[reviewed_by_id]
    )
 

    __table_args__ = (
        UniqueConstraint('email', 'college_id', name='unique_email_college'),
        UniqueConstraint('username', 'college_id', name='unique_username_college'),
    )
