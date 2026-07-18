from enum import Enum
from typing import Literal
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
import re

def _validate_password_complexity(v: str) -> str:
    """Shared helper function to enforce password complexity rules."""
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_+-]", v):
        raise ValueError("Password must contain at least one special character")
    return v

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
    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return _validate_password_complexity(v)

class UserLogin(BaseModel):
    username_or_email: str
    password: str
    college_slug: str

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return _validate_password_complexity(v)

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
