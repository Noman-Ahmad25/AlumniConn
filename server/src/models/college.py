from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base
 
class College(Base):
    __tablename__ = 'colleges'
 
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, nullable=True)
    established_year = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    domain = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=True) # nullable for now until backfill, then altered to False in migration
    is_approved = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 
    # Relationships
    branding = relationship("CollegeBranding", back_populates="college", uselist=False, cascade="all, delete-orphan")
    users = relationship("User", back_populates="college")
    profiles = relationship("Profile", back_populates="college")       
    connections = relationship("Connection", back_populates="college")  
    messages = relationship("Message", back_populates="college")        
 