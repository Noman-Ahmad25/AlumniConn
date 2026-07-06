from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.user import User, UserRole, AlumniStatus
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType


def create_alumni_request(
    db: Session,
    user_id: int,
    college_id: int
) -> User | dict:
    """
    Create a request to become ALUMNI.
    
    SECURITY:
    - Only STUDENT can apply for ALUMNI role
    - Can only apply for the college they're currently associated with
    - Cannot have multiple pending requests
    
    Args:
        db: Database session
        user_id: ID of user requesting ALUMNI role
        college_id: ID of college to apply for
    
    Returns:
        Updated User object
    
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
    
    # Check if already ALUMNI or requested
    if user.alumni_status == AlumniStatus.APPROVED or user.role == UserRole.ALUMNI:
        raise ValueError("You are already an alumni.")
        
    if user.alumni_status == AlumniStatus.PENDING:
        raise ValueError("You already have a pending alumni request.")
    
    user.alumni_status = AlumniStatus.PENDING
    user.alumni_requested_at = func.now()
    user.alumni_reviewed_at = None
    user.reviewed_by_id = None
    user.review_notes = None
    
    db.commit()
    db.refresh(user)
    
    # Optional: trigger an event for ALUMNI_REQUEST_SUBMITTED if needed
    
    return user


def get_alumni_request(db: Session, user_id: int) -> User | None:
    """Get a user by ID to inspect their alumni request."""
    return db.query(User).filter(
        User.id == user_id
    ).first()


def list_alumni_requests_for_admin(
    db: Session,
    admin_id: int,
    college_id: int,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100
) -> list[User]:
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
        List of User objects
    
    Raises:
        ValueError: If admin is not of the specified college
    """
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin:
        raise ValueError("Admin not found.")
    
    # Security: ADMIN can only manage requests for their own college
    if admin.college_id != college_id:
        raise ValueError("You can only view requests for your own college.")
    
    query = db.query(User).filter(
        User.college_id == college_id,
        User.alumni_status != AlumniStatus.NOT_REQUESTED
    )
    
    if status:
        query = query.filter(User.alumni_status == status)
    
    return query.order_by(User.alumni_requested_at.desc()).offset(skip).limit(limit).all()


def approve_alumni_request(
    db: Session,
    user_id: int,
    reviewer_id: int
) -> User:
    """
    Approve an alumni request and update user role.
    
    SECURITY:
    - Only ADMIN of the same college can approve
    - ADMIN cannot approve their own request
    - User's status must be PENDING
    
    Args:
        db: Database session
        user_id: ID of user to approve
        reviewer_id: ID of user approving (should be ADMIN of the college)
    
    Returns:
        Updated User object
    
    Raises:
        ValueError: If security checks fail
    """
    target_user = get_alumni_request(db, user_id)
    if not target_user:
        raise ValueError("User not found.")
    
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer:
        raise ValueError("Reviewer not found.")
    
    # Security: Reviewer must be ADMIN of the college
    if reviewer.role != UserRole.ADMIN or reviewer.college_id != target_user.college_id:
        raise ValueError("You are not an admin of this college.")
    
    # Security: Cannot approve own request
    if target_user.id == reviewer_id:
        raise ValueError("You cannot approve your own alumni request.")
    
    # Security: Can only approve PENDING requests
    if target_user.alumni_status != AlumniStatus.PENDING:
        raise ValueError(f"Cannot approve user with alumni status '{target_user.alumni_status}'.")
    
    # Update user role and status
    target_user.role = UserRole.ALUMNI
    target_user.alumni_status = AlumniStatus.APPROVED
    target_user.reviewed_by_id = reviewer_id
    target_user.alumni_reviewed_at = func.now()
    
    db.commit()
    db.refresh(target_user)
    
    event_bus.publish(NotificationType.ALUMNI_REQUEST_APPROVED.value, {
        "recipient_id": target_user.id,
        "notification_type": NotificationType.ALUMNI_REQUEST_APPROVED,
        "title": "Alumni Request Approved",
        "message": "Your request to become an alumni has been approved.",
        "actor_id": reviewer_id,
        "metadata_": {"user_id": target_user.id}
    })
    
    return target_user


def reject_alumni_request(
    db: Session,
    user_id: int,
    reviewer_id: int,
    rejection_reason: str | None = None
) -> User:
    """
    Reject an alumni request.
    
    SECURITY:
    - Only ADMIN of the same college can reject
    - ADMIN cannot reject their own request
    - User's status must be PENDING
    
    Args:
        db: Database session
        user_id: ID of user to reject
        reviewer_id: ID of user rejecting (should be ADMIN of the college)
        rejection_reason: Optional reason for rejection
    
    Returns:
        Updated User object
    
    Raises:
        ValueError: If security checks fail
    """
    target_user = get_alumni_request(db, user_id)
    if not target_user:
        raise ValueError("User not found.")
    
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer:
        raise ValueError("Reviewer not found.")
    
    # Security: Reviewer must be ADMIN of the college
    if reviewer.role != UserRole.ADMIN or reviewer.college_id != target_user.college_id:
        raise ValueError("You are not an admin of this college.")
    
    # Security: Cannot reject own request
    if target_user.id == reviewer_id:
        raise ValueError("You cannot reject your own alumni request.")
    
    # Security: Can only reject PENDING requests
    if target_user.alumni_status != AlumniStatus.PENDING:
        raise ValueError(f"Cannot reject user with alumni status '{target_user.alumni_status}'.")
    
    target_user.alumni_status = AlumniStatus.REJECTED
    target_user.reviewed_by_id = reviewer_id
    target_user.alumni_reviewed_at = func.now()
    target_user.review_notes = rejection_reason
    
    db.commit()
    db.refresh(target_user)
    
    event_bus.publish(NotificationType.ALUMNI_REQUEST_REJECTED.value, {
        "recipient_id": target_user.id,
        "notification_type": NotificationType.ALUMNI_REQUEST_REJECTED,
        "title": "Alumni Request Rejected",
        "message": "Your request to become an alumni has been rejected.",
        "actor_id": reviewer_id,
        "metadata_": {"user_id": target_user.id}
    })
    
    return target_user
