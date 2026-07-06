from pydantic import BaseModel, ConfigDict
from src.schemas.profile import ProfileResponse

class RecommendationResponse(ProfileResponse):
    match_score: float
    explanation: str

    model_config = ConfigDict(from_attributes=True)

class PaginatedRecommendations(BaseModel):
    items: list[RecommendationResponse]
    next_cursor: float | None = None
