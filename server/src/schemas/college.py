from pydantic import BaseModel, ConfigDict

class CollegeCreate(BaseModel):
    name: str
    location: str
    established_year: int
    domain: str
    description: str | None = None  

class CollegeResponse(BaseModel):
    id: int
    name: str
    location: str | None = None
    established_year: int | None = None
    domain: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)