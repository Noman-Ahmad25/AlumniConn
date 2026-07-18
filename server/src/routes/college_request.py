from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.database.session import get_db
from src.utils.rbac import require_super_admin
from src.utils.dispatcher import AbstractTaskDispatcher, get_task_dispatcher
from src.schemas.request import (
    CollegeRequestCreate,
    CollegeRequestResponse,
    RequestRejectionPayload,
)
from src.services import college_request_service

router = APIRouter()

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    request_id: int


@router.post(
    "/",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["College Requests"],
)
def request_college_creation(
    college_data: CollegeRequestCreate,
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher)
):
    """
    Anyone can request to onboard a college.
    Creates a CollegeRequest with PENDING status, awaiting email verification.
    """
    try:
        return college_request_service.create_college_request(db, college_data, task_dispatcher)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/verify-email",
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    success = college_request_service.verify_college_email(db, token)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    return {"message": "Email verified successfully"}


@router.post(
    "/resend-verification",
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher)
):
    college_request_service.resend_college_verification(db, request.request_id, task_dispatcher)
    return {"message": "If the request exists and is unverified, a new verification link has been sent."}


@router.get(
    "/",
    response_model=list[CollegeRequestResponse],
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def list_college_requests(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """
    Only SUPER_ADMIN can view all verified college requests.
    """
    return college_request_service.list_college_requests_for_super_admin(
        db, status=status_filter, skip=skip, limit=limit
    )


@router.get(
    "/{request_id}",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def get_college_request(
    request_id: int,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """
    Get details of a specific college request.
    Only SUPER_ADMIN can view.
    """
    college_req = college_request_service.get_college_request(db, request_id)
    if not college_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return college_req


@router.patch(
    "/{request_id}/approve",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def approve_college_request(
    request_id: int,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher),
):
    """
    Approve a college request.
    Only SUPER_ADMIN can approve.
    
    On approval:
    - Creates the actual College
    - Creates active ADMIN user and Profile
    """
    try:
        return college_request_service.approve_college_request(
            db, request_id, current_user.id, task_dispatcher
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/{request_id}/reject",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def reject_college_request(
    request_id: int,
    payload: RequestRejectionPayload | None = None,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """
    Reject a college request.
    Only SUPER_ADMIN can reject.
    """
    reason = payload.reason if payload else None
    try:
        return college_request_service.reject_college_request(
            db, request_id, current_user.id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
