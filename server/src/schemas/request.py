from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional


class CollegeRequestCreate(BaseModel):
    """Request body for creating a college request"""
    name: str = Field(alias="collegeName")
    domain: str
    location: str
    established_year: int = Field(alias="establishedYear")
    description: Optional[str] = None
    admin_name: str = Field(alias="adminName")
    admin_email: EmailStr = Field(alias="adminEmail")
    admin_password: str = Field(alias="adminPassword", min_length=8)

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("name", "domain", "location", "admin_name")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty")
        return cleaned

    @field_validator("domain")
    @classmethod
    def normalize_domain(cls, value: str) -> str:
        return value.strip().lower()


class CollegeRequestResponse(BaseModel):
    """Response model for college requests"""
    id: int
    name: str
    domain: str
    location: Optional[str] = None
    established_year: Optional[int] = None
    description: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    requested_by: Optional[int] = None
    status: str  # "pending", "approved", "rejected"
    reviewed_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    college_id: Optional[int] = None  # Set when approved
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class AlumniRequestCreate(BaseModel):
    """Request body for applying to become alumni"""
    pass  # Only needs user_id and college_id from context


class AlumniRequestResponse(BaseModel):
    """Response model for alumni requests"""
    id: int
    user_id: int
    college_id: int
    status: str  # "pending", "approved", "rejected"
    reviewed_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class RequestApprovalPayload(BaseModel):
    """Payload for approving a request"""
    pass  # No additional data needed beyond the ID


class RequestRejectionPayload(BaseModel):
    """Payload for rejecting a request"""
    reason: Optional[str] = None
