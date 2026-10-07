from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Any


class PlatformOverviewResponse(BaseModel):
    total_colleges: int
    active_colleges: int
    pending_requests: int
    total_users: int
    alumni_count: int
    student_count: int
    recent_activity: list[dict[str, Any]]


class AdminCollegeUser(BaseModel):
    id: int
    username: str
    email: str
    full_name: str | None = None


class AdminCollegeItem(BaseModel):
    id: int
    name: str
    slug: str | None = None
    domain: str
    location: str | None = None
    established_year: int | None = None
    description: str | None = None
    is_approved: bool
    is_active: bool
    created_at: datetime | None = None
    total_users: int = 0
    alumni_count: int = 0
    student_count: int = 0
    admin_user: AdminCollegeUser | None = None


class AdminUserItem(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    email_verified: bool
    college_id: int | None = None
    college_name: str | None = None
    college_slug: str | None = None
    full_name: str | None = None
    job_title: str | None = None
    company: str | None = None
    major: str | None = None
    grad_year: int | None = None
    location: str | None = None
    created_at: datetime | None = None
    profile_picture: str | None = None


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: str


class CollegeStatusUpdate(BaseModel):
    is_active: bool


class DemoLoginRequest(BaseModel):
    demo_role: str  # "super_admin" | "college_admin" | "alumni" | "student"
