from pydantic import BaseModel, ConfigDict
from typing import Any

class CollegeBrandingResponse(BaseModel):
    logo_url: str | None = None
    banner_url: str | None = None
    favicon_url: str | None = None
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    typography_preset: str
    homepage_layout: str
    welcome_message: str | None = None
    motto: str | None = None
    social_links: dict[str, Any] | None = None
    quick_links: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)

class CollegeCreate(BaseModel):
    name: str
    location: str
    established_year: int
    domain: str
    description: str | None = None  

class CollegeResponse(BaseModel):
    id: int
    name: str
    slug: str | None = None
    location: str | None = None
    established_year: int | None = None
    domain: str
    description: str | None = None
    is_approved: bool

    model_config = ConfigDict(from_attributes=True)
    
class CollegePublicResponse(BaseModel):
    id: int
    name: str
    slug: str
    location: str | None = None
    established_year: int | None = None
    description: str | None = None
    branding: CollegeBrandingResponse | None = None
    
    model_config = ConfigDict(from_attributes=True)