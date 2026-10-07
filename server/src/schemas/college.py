from pydantic import BaseModel, ConfigDict
from typing import Any

class CollegeTestimonial(BaseModel):
    quote: str
    author: str
    role: str | None = None
    avatar_url: str | None = None

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
    testimonials: list[CollegeTestimonial] | None = None
    quick_links: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)

class CollegeStatsResponse(BaseModel):
    alumni_count: int = 0
    student_count: int = 0
    connection_count: int = 0
    majors_count: int = 0
    posts_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class CollegeCreate(BaseModel):
    name: str
    location: str
    established_year: int
    domain: str
    description: str | None = None  

class CollegeBrandingUpdate(BaseModel):
    logo_url: str | None = None
    banner_url: str | None = None
    favicon_url: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None
    background_color: str | None = None
    typography_preset: str | None = None
    homepage_layout: str | None = None
    welcome_message: str | None = None
    motto: str | None = None
    social_links: dict[str, Any] | None = None
    testimonials: list[CollegeTestimonial] | None = None
    quick_links: dict[str, Any] | None = None

class CollegeUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    established_year: int | None = None
    description: str | None = None
    branding: CollegeBrandingUpdate | None = None

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
    stats: CollegeStatsResponse | None = None
    
    model_config = ConfigDict(from_attributes=True)