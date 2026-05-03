from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Optional

class ConnectionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ConnectionCreate(BaseModel):
    receiver_id: int

# 1. Create a tiny schema just for summarizing users in responses
class UserSummary(BaseModel):
    id: int
    username: str
    profile_pic_url: str | None = None 

    model_config = ConfigDict(from_attributes=True)

# 2. Upgrade the response to include the full user objects
class ConnectionResponse(BaseModel):
    id: int
    status: ConnectionStatus
    
    user: UserSummary
    model_config = ConfigDict(from_attributes=True)