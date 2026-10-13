from typing import Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict

from src.database import get_db
from src.models.user import User, UserRole
from src.models.college import College
from src.models.message import Message
from src.models.profile import Profile
from src.schemas.user import UserResponse
from src.utils.dependency import get_current_user
from src.services.alumni_service import (
    create_alumni_request,
    get_alumni_request,
    list_alumni_requests_for_admin,
    approve_alumni_request,
    reject_alumni_request
)

router = APIRouter()

class RejectionRequest(BaseModel):
    reason: str | None = None

class AlumniRequestResponse(BaseModel):
    id: int
    user_id: int
    username: str | None = None
    email: str | None = None
    full_name: str | None = None
    college_id: int | None = None
    status: str
    reviewed_by: int | None = None
    rejection_reason: str | None = None
    created_at: datetime | None = None
    reviewed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


def format_alumni_request(user: User) -> dict:
    return {
        "id": user.id,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.profile.full_name if user.profile else None,
        "college_id": user.college_id,
        "status": user.alumni_status.value if hasattr(user.alumni_status, "value") else str(user.alumni_status),
        "reviewed_by": user.reviewed_by_id,
        "rejection_reason": user.review_notes,
        "created_at": user.alumni_requested_at or user.created_at,
        "reviewed_at": user.alumni_reviewed_at,
    }


# ----------------- /alumni-requests endpoints (frontend standard) ----------------- #

@router.get(
    "/alumni-requests/",
    response_model=list[AlumniRequestResponse],
    tags=["Admin", "Alumni Requests"],
    summary="List Alumni Requests"
)
@router.get(
    "/alumni-requests",
    response_model=list[AlumniRequestResponse],
    tags=["Admin", "Alumni Requests"],
    summary="List Alumni Requests"
)
def list_alumni_requests(
    status_filter: Annotated[str | None, Query()] = None,
    status: Annotated[str | None, Query()] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Only admins can access alumni requests")
    
    filter_value = status_filter or status
    try:
        users = list_alumni_requests_for_admin(
            db=db,
            admin_id=current_user.id,
            college_id=current_user.college_id,
            status=filter_value,
            skip=skip,
            limit=limit,
            admin_user=current_user,
        )
        return [format_alumni_request(u) for u in users]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/alumni-requests/",
    response_model=AlumniRequestResponse,
    tags=["Alumni", "Alumni Requests"],
    summary="Request Alumni Status"
)
@router.post(
    "/alumni-requests",
    response_model=AlumniRequestResponse,
    tags=["Alumni", "Alumni Requests"],
    summary="Request Alumni Status"
)
def submit_alumni_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = create_alumni_request(db, current_user.id, current_user.college_id)
        return format_alumni_request(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/alumni-requests/me",
    response_model=AlumniRequestResponse,
    tags=["Alumni", "Alumni Requests"],
    summary="Get Current User Alumni Request Status"
)
def get_my_alumni_request(
    current_user: User = Depends(get_current_user)
):
    return format_alumni_request(current_user)


@router.get(
    "/alumni-requests/{request_id}",
    response_model=AlumniRequestResponse,
    tags=["Admin", "Alumni Requests"],
    summary="Get Alumni Request"
)
def get_alumni_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Only admins can access alumni requests")
    
    user = get_alumni_request(db, request_id)
    if not user or user.college_id != current_user.college_id:
        raise HTTPException(status_code=404, detail="Alumni request not found")
    return format_alumni_request(user)


@router.post(
    "/alumni-requests/{request_id}/approve",
    response_model=AlumniRequestResponse,
    tags=["Admin", "Alumni Requests"],
    summary="Approve Alumni Request"
)
def approve_alumni_request_endpoint(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = approve_alumni_request(
            db=db,
            user_id=request_id,
            reviewer_id=current_user.id
        )
        return format_alumni_request(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/alumni-requests/{request_id}/reject",
    response_model=AlumniRequestResponse,
    tags=["Admin", "Alumni Requests"],
    summary="Reject Alumni Request"
)
def reject_alumni_request_endpoint(
    request_id: int,
    rejection_data: RejectionRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = reject_alumni_request(
            db=db,
            user_id=request_id,
            reviewer_id=current_user.id,
            rejection_reason=rejection_data.reason if rejection_data else None
        )
        return format_alumni_request(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------- Legacy routes for backward compatibility ----------------- #

@router.post(
    "/alumni/request",
    response_model=UserResponse,
    tags=["Alumni"],
    summary="Request Alumni Status (Legacy)"
)
def request_alumni_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = create_alumni_request(db, current_user.id, current_user.college_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/admin/alumni/pending",
    response_model=list[UserResponse],
    tags=["Admin", "Alumni"],
    summary="List Pending Alumni Requests (Legacy)"
)
def list_pending_alumni(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        users = list_alumni_requests_for_admin(
            db=db,
            admin_id=current_user.id,
            college_id=current_user.college_id,
            status="pending",
            skip=skip,
            limit=limit
        )
        return users
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch(
    "/admin/alumni/{user_id}/approve",
    response_model=UserResponse,
    tags=["Admin", "Alumni"],
    summary="Approve Alumni Request (Legacy)"
)
def approve_alumni(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = approve_alumni_request(
            db=db,
            user_id=user_id,
            reviewer_id=current_user.id
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch(
    "/admin/alumni/{user_id}/reject",
    response_model=UserResponse,
    tags=["Admin", "Alumni"],
    summary="Reject Alumni Request (Legacy)"
)
def reject_alumni(
    user_id: int,
    rejection_data: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = reject_alumni_request(
            db=db,
            user_id=user_id,
            reviewer_id=current_user.id,
            rejection_reason=rejection_data.reason
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

