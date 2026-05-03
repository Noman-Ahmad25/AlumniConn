from src.database import Base
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"


    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    college_id = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)