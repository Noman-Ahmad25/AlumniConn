from enum import Enum
from typing import Literal
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


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

    def validate_passwords(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number.")
        return value
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    college_id: int

    def validate_passwords(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number.")
        return value

class SuperAdminLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_passwords(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number.")
        return value

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
