from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CommentCreate(BaseModel):
    content: str
    post_id: int


        
class CommentResponse(BaseModel):
    id: int
    user_id: int
    post_id: int

    username: str
    profile_picture: str | None = None

    content: str
    created_at: datetime    

    model_config = ConfigDict(from_attributes=True)