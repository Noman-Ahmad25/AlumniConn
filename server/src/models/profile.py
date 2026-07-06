from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship, deferred
from pgvector.sqlalchemy import Vector
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
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True)
    full_name = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    job_industry = Column(String, nullable=True)
    job_description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # New semantic fields for recommendation
    skills = Column(JSON, nullable=True)
    interests = Column(JSON, nullable=True)
    grad_year = Column(Integer, nullable=True)
    major = Column(String, nullable=True)
    
    semantic_hash = Column(String, nullable=True)
    embedding = deferred(Column(Vector(384), nullable=True))
 
    # Relationships
    user = relationship("User", back_populates="profile")
    college = relationship("College", back_populates="profiles")  # Fix: College now has `profiles`
 
