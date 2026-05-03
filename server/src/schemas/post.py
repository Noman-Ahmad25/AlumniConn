from pydantic import BaseModel, model_validator, ConfigDict
from datetime import datetime

class PostCreate(BaseModel):
    content: str | None = None
    image_url: str | None = None
    is_opportunity: bool = False

    @model_validator(mode="after")
    def validate_post(self):
        if not self.content and not self.image_url:
            raise ValueError("Post must have content or image")
        return self


class PostResponse(BaseModel):
    id: int
    user_id: int

    username: str
    profile_picture: str | None = None
    
    content: str | None = None
    image_url: str | None = None
    is_opportunity: bool
    created_at: datetime    

    likes_count: int = 0
    comments_count: int = 0
    liked_by_current_user: bool = False
    connection_status: str = "none"  # "self" | "none" | "pending" | "connected"

    model_config = ConfigDict(from_attributes=True)
