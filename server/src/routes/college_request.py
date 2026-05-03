from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.utils.rbac import require_super_admin
from src.schemas.request import (
    CollegeRequestCreate,
    CollegeRequestResponse,
    RequestRejectionPayload,
)
from src.services import college_request_service

router = APIRouter()


@router.post(
    "/",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["College Requests"],
)
def request_college_creation(
    college_data: CollegeRequestCreate,
    db: Session = Depends(get_db),
):
    """
    Anyone can request to onboard a college.
    Creates a CollegeRequest with PENDING status.
    """
    try:
        return college_request_service.create_college_request(db, college_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
    Only SUPER_ADMIN can view all college requests.
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


@router.post(
    "/{request_id}/approve",
    response_model=CollegeRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["College Requests"],
)
def approve_college_request(
    request_id: int,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """
    Approve a college request.
    Only SUPER_ADMIN can approve.
    
    On approval:
    - Creates the actual College
    - Creates inactive ADMIN user
    - Sends activation link
    """
    try:
        return college_request_service.approve_college_request(db, request_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
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
