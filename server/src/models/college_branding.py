from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base
from sqlalchemy.dialects.postgresql import JSONB

class CollegeBranding(Base):
    __tablename__ = 'college_brandings'

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Images
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    favicon_url = Column(String, nullable=True)
    
    # Theme Colors
    primary_color = Column(String, default="#007bff", nullable=False)
    secondary_color = Column(String, default="#6c757d", nullable=False)
    accent_color = Column(String, default="#0056b3", nullable=False)
    background_color = Column(String, default="#f8f9fa", nullable=False)
    
    # Typography & Layout
    typography_preset = Column(String, default="inter", nullable=False)
    homepage_layout = Column(String, default="standard", nullable=False)
    
    # Content
    welcome_message = Column(String, nullable=True)
    motto = Column(String, nullable=True)
    
    # JSON Configs
    social_links = Column(JSONB, nullable=True)
    quick_links = Column(JSONB, nullable=True)

    # Relationships
    college = relationship("College", back_populates="branding")
