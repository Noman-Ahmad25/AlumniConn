from enum import Enum
from typing import Literal
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class UserRole(str, Enum):

    ADMIN = "admin"
    ALUMNI = "alumni"
    STUDENT = "student"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    college_id: int
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    college_id: int

class SuperAdminLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DiscoverUserResponse(BaseModel):
    id: int
    username: str
    profile_picture: str | None = None
    connection_status: Literal["none", "pending_sent", "pending_received"]
