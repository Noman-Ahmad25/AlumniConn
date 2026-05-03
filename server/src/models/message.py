from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
 
from src.database import Base
 
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)

    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)

    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages")
