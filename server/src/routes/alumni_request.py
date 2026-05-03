from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.models.user import User, UserRole
from src.utils.rbac import require_admin, require_student
from src.utils.dependency import get_current_user
from src.schemas.request import (
    AlumniRequestCreate,
    AlumniRequestResponse,
    RequestRejectionPayload,
)
from src.services import alumni_request_service

router = APIRouter()


@router.post(
    "/",
    response_model=AlumniRequestResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Alumni Requests"],
)
def request_alumni_role(
    alumni_data: AlumniRequestCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Only STUDENT can apply for ALUMNI role.
    Creates an AlumniRequest with PENDING status.
    
    SECURITY:
    - Only STUDENT role can access
    - Can only apply for their own college
    - Cannot have multiple pending requests
    """
    try:
        return alumni_request_service.create_alumni_request(
            db, current_user.id, current_user.college_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/",
    response_model=list[AlumniRequestResponse],
    status_code=status.HTTP_200_OK,
    tags=["Alumni Requests"],
)
def list_alumni_requests(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Only ADMIN can view alumni requests for their college.
    
    SECURITY:
    - Only ADMIN role can access
    - Can only view requests for their own college
    """
    try:
        return alumni_request_service.list_alumni_requests_for_admin(
            db, current_user.id, current_user.college_id, status=status_filter, skip=skip, limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/{request_id}",
    response_model=AlumniRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["Alumni Requests"],
)
def get_alumni_request(
    request_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get details of a specific alumni request.
    Only ADMIN of that college can view.
    """
    alumni_req = alumni_request_service.get_alumni_request(db, request_id)
    if not alumni_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    
    # Security: ADMIN can only view requests for their own college
    if alumni_req.college_id != current_user.college_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return alumni_req


@router.post(
    "/{request_id}/approve",
    response_model=AlumniRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["Alumni Requests"],
)
def approve_alumni_request(
    request_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Approve an alumni request.
    Only ADMIN of that college can approve.
    ADMIN cannot approve their own request.
    
    On approval:
    - Updates user.role from STUDENT to ALUMNI
    """
    try:
        return alumni_request_service.approve_alumni_request(db, request_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/{request_id}/reject",
    response_model=AlumniRequestResponse,
    status_code=status.HTTP_200_OK,
    tags=["Alumni Requests"],
)
def reject_alumni_request(
    request_id: int,
    payload: RequestRejectionPayload | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Reject an alumni request.
    Only ADMIN of that college can reject.
    ADMIN cannot reject their own request.
    """
    reason = payload.reason if payload else None
    try:
        return alumni_request_service.reject_alumni_request(
            db, request_id, current_user.id, reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
