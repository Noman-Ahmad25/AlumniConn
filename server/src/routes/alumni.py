from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.user import User
from src.schemas.user import UserResponse
from src.utils.dependency import get_current_user
from src.services.alumni_service import (
    create_alumni_request,
    list_alumni_requests_for_admin,
    approve_alumni_request,
    reject_alumni_request
)
from pydantic import BaseModel

router = APIRouter()

class RejectionRequest(BaseModel):
    reason: str | None = None

@router.post(
    "/alumni/request",
    response_model=UserResponse,
    tags=["Alumni"],
    summary="Request Alumni Status"
)
def request_alumni_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a request for the current student to become an ALUMNI.
    The user's alumni_status will transition to PENDING.
    """
    try:
        user = create_alumni_request(db, current_user.id, current_user.college_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/admin/alumni/pending",
    response_model=list[UserResponse],
    tags=["Admin", "Alumni"],
    summary="List Pending Alumni Requests"
)
def list_pending_alumni(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns users whose alumni_status is PENDING for the admin's college.
    """
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
    summary="Approve Alumni Request"
)
def approve_alumni(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approves an alumni request for a user.
    Sets role to ALUMNI and alumni_status to APPROVED.
    """
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
    summary="Reject Alumni Request"
)
def reject_alumni(
    user_id: int,
    rejection_data: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rejects an alumni request for a user.
    Sets alumni_status to REJECTED and records the reason.
    """
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
