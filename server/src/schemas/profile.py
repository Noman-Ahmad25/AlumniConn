from pydantic import BaseModel, ConfigDict

class ProfileBase(BaseModel):
    full_name: str | None = None
    profile_picture: str | None = None
    bio: str | None = None

    company: str | None = None
    job_title: str | None = None
    job_industry: str | None = None
    job_description: str | None = None

    location: str | None = None
    
    skills: list[str] | None = None
    interests: list[str] | None = None
    grad_year: int | None = None
    major: str | None = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass   

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    connection_status: str = "self"
    full_name: str | None = None
    profile_picture: str | None = None
    bio: str | None = None

    company: str | None = None
    job_title: str | None = None
    job_industry: str | None = None
    job_description: str | None = None

    location: str | None = None
    
    skills: list[str] | None = None
    interests: list[str] | None = None
    grad_year: int | None = None
    major: str | None = None
    
    username: str = ""

    model_config = ConfigDict(from_attributes=True)
