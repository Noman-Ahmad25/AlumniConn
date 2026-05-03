from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
 
from src.database import Base
 
 
class Profile(Base):
    __tablename__ = "profiles"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    full_name = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    job_industry = Column(String, nullable=True)
    job_description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
 
    # Relationships
    user = relationship("User", back_populates="profile")
    college = relationship("College", back_populates="profiles")  # Fix: College now has `profiles`
 
