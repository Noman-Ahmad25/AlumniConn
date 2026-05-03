from pydantic import BaseModel, ConfigDict

class LikeResponse(BaseModel):
    post_id: int
    liked: bool

    model_config = ConfigDict(from_attributes=True)