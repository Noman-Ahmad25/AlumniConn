from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MessageUser(BaseModel):
    id: int
    username: str
    profile_picture: str | None = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    content: str
    image_url: str | None = None
    timestamp: datetime
    sender: MessageUser
    
    model_config = ConfigDict(from_attributes=True)

class InboxMessage(BaseModel):
    conversation_id: int
    user_id: int
    username: str
    profile_picture: str | None = None
    last_message: str | None = None
    last_time: datetime | None = None

    model_config = ConfigDict(from_attributes=True)