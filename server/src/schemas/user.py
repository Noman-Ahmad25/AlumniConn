from enum import Enum
from typing import Literal
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class UserRole(str, Enum):

    ADMIN = "admin"
    ALUMNI = "alumni"
    STUDENT = "student"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    college_slug: str
    role: UserRole

class UserLogin(BaseModel):
    username_or_email: str
    password: str
    college_slug: str

class SuperAdminLogin(BaseModel):
    email: EmailStr
    password: str

class AlumniStatus(str, Enum):
    NOT_REQUESTED = "not_requested"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    
    alumni_status: AlumniStatus
    alumni_requested_at: datetime | None = None
    alumni_reviewed_at: datetime | None = None
    reviewed_by_id: int | None = None
    review_notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DiscoverUserResponse(BaseModel):
    id: int
    username: str
    profile_picture: str | None = None
    connection_status: Literal["none", "pending_sent", "pending_received"]

class ForgotPasswordRequest(BaseModel):
    username_or_email: str
    college_slug: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
