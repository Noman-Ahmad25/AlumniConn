from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.alumni_request import AlumniRequest, AlumniRequestStatus
from src.models.user import User, UserRole


def create_alumni_request(
    db: Session,
    user_id: int,
    college_id: int
) -> AlumniRequest | dict:
    """
    Create a request to become ALUMNI.
    
    SECURITY:
    - Only STUDENT can apply for ALUMNI role
    - Can only apply for the college they're currently associated with
    - Cannot have multiple pending requests for same college
    
    Args:
        db: Database session
        user_id: ID of user requesting ALUMNI role
        college_id: ID of college to apply for
    
    Returns:
        AlumniRequest object or error dict
    
    Raises:
        ValueError: If security checks fail
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found.")
    
    # Security: Only STUDENT can apply
    if user.role != UserRole.STUDENT:
        raise ValueError("Only students can apply for alumni role.")
    
    # Security: Can only apply for own college
    if user.college_id != college_id:
        raise ValueError("You can only apply for your own college.")
    
    # Check if already ALUMNI
    if user.role == UserRole.ALUMNI:
        raise ValueError("You are already an alumni.")
    
    # Check for existing pending or approved request
    existing_request = db.query(AlumniRequest).filter(
        AlumniRequest.user_id == user_id,
        AlumniRequest.college_id == college_id,
        AlumniRequest.status.in_([AlumniRequestStatus.PENDING, AlumniRequestStatus.APPROVED])
    ).first()
    if existing_request:
        raise ValueError("You already have a pending or approved alumni request.")
    
    db_request = AlumniRequest(
        user_id=user_id,
        college_id=college_id,
        status=AlumniRequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_alumni_request(db: Session, request_id: int) -> AlumniRequest | None:
    """Get an alumni request by ID."""
    return db.query(AlumniRequest).filter(
        AlumniRequest.id == request_id
    ).first()


def list_alumni_requests_for_admin(
    db: Session,
    admin_id: int,
    college_id: int,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100
) -> list[AlumniRequest]:
    """
    List alumni requests for an ADMIN of a specific college.
    
    SECURITY:
    - ADMIN can only view requests for their own college
    
    Args:
        db: Database session
        admin_id: ID of admin user
        college_id: ID of college
        status: Filter by status (optional)
        skip: Pagination offset
        limit: Pagination limit
    
    Returns:
        List of AlumniRequest objects
    
    Raises:
        ValueError: If admin is not of the specified college
    """
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin:
        raise ValueError("Admin not found.")
    
    # Security: ADMIN can only manage requests for their own college
    if admin.college_id != college_id:
        raise ValueError("You can only view requests for your own college.")
    
    query = db.query(AlumniRequest).filter(
        AlumniRequest.college_id == college_id
    )
    
    if status:
        query = query.filter(AlumniRequest.status == status)
    
    return query.order_by(AlumniRequest.created_at.desc()).offset(skip).limit(limit).all()


def approve_alumni_request(
    db: Session,
    request_id: int,
    reviewer_id: int
) -> AlumniRequest:
    """
    Approve an alumni request and update user role.
    
    SECURITY:
    - Only ADMIN of the same college can approve
    - ADMIN cannot approve their own request
    - Request must be PENDING
    
    Args:
        db: Database session
        request_id: ID of request to approve
        reviewer_id: ID of user approving (should be ADMIN of the college)
    
    Returns:
        Updated AlumniRequest object
    
    Raises:
        ValueError: If security checks fail
    """
    alumni_req = get_alumni_request(db, request_id)
    if not alumni_req:
        raise ValueError("Request not found.")
    
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer:
        raise ValueError("Reviewer not found.")
    
    # Security: Reviewer must be ADMIN of the college
    if reviewer.role != UserRole.ADMIN or reviewer.college_id != alumni_req.college_id:
        raise ValueError("You are not an admin of this college.")
    
    # Security: Cannot approve own request
    if alumni_req.user_id == reviewer_id:
        raise ValueError("You cannot approve your own alumni request.")
    
    # Security: Can only approve PENDING requests
    if alumni_req.status != AlumniRequestStatus.PENDING:
        raise ValueError(f"Cannot approve request with status '{alumni_req.status}'.")
    
    # Update user role
    student = db.query(User).filter(User.id == alumni_req.user_id).first()
    if student:
        student.role = UserRole.ALUMNI
    
    # Update request
    alumni_req.status = AlumniRequestStatus.APPROVED
    alumni_req.reviewed_by = reviewer_id
    alumni_req.reviewed_at = func.now()
    
    db.commit()
    db.refresh(alumni_req)
    return alumni_req


def reject_alumni_request(
    db: Session,
    request_id: int,
    reviewer_id: int,
    rejection_reason: str | None = None
) -> AlumniRequest:
    """
    Reject an alumni request.
    
    SECURITY:
    - Only ADMIN of the same college can reject
    - ADMIN cannot reject their own request
    - Request must be PENDING
    
    Args:
        db: Database session
        request_id: ID of request to reject
        reviewer_id: ID of user rejecting (should be ADMIN of the college)
        rejection_reason: Optional reason for rejection
    
    Returns:
        Updated AlumniRequest object
    
    Raises:
        ValueError: If security checks fail
    """
    alumni_req = get_alumni_request(db, request_id)
    if not alumni_req:
        raise ValueError("Request not found.")
    
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer:
        raise ValueError("Reviewer not found.")
    
    # Security: Reviewer must be ADMIN of the college
    if reviewer.role != UserRole.ADMIN or reviewer.college_id != alumni_req.college_id:
        raise ValueError("You are not an admin of this college.")
    
    # Security: Cannot reject own request
    if alumni_req.user_id == reviewer_id:
        raise ValueError("You cannot reject your own alumni request.")
    
    # Security: Can only reject PENDING requests
    if alumni_req.status != AlumniRequestStatus.PENDING:
        raise ValueError(f"Cannot reject request with status '{alumni_req.status}'.")
    
    alumni_req.status = AlumniRequestStatus.REJECTED
    alumni_req.reviewed_by = reviewer_id
    alumni_req.reviewed_at = func.now()
    alumni_req.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(alumni_req)
    return alumni_req
