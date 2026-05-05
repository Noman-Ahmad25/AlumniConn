from datetime import datetime, timedelta
import os
import re

from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.college_request import CollegeRequest, CollegeRequestStatus
from src.models.college import College
from src.models.user import User, UserRole
from src.models.profile import Profile
from src.schemas.request import CollegeRequestCreate
from src.utils.security import hash_password


def create_college_request(
    db: Session, 
    college_data: CollegeRequestCreate,
) -> CollegeRequest:
    """
    Create a new college request.
    
    Creates a User record (is_active=False) immediately with the provided password.
    Links the CollegeRequest to this user via requested_by.
    
    Args:
        db: Database session
        college_data: Public college and admin details (including admin_password)
    
    Returns:
        CollegeRequest object
    
    Raises:
        ValueError: If domain already exists or if user has pending request
    """
    admin_email = str(college_data.admin_email).strip().lower()
    email_domain = _domain_from_email(admin_email)
    domain = college_data.domain.strip().lower()

    if domain != email_domain:
        raise ValueError("Admin email must belong to the requested college domain.")

    existing_college = db.query(College).filter(
        func.lower(College.domain) == domain
    ).first()
    if existing_college:
        raise ValueError("Domain already in use by an existing college.")
    
    existing_request = db.query(CollegeRequest).filter(
        CollegeRequest.status == CollegeRequestStatus.PENDING,
        (
            (func.lower(CollegeRequest.domain) == domain)
            | (func.lower(CollegeRequest.admin_email) == admin_email)
        )
    ).first()
    if existing_request:
        raise ValueError("This college or admin already has a pending request.")
    
    # Create the admin user with is_active=False
    admin_user = User(
        username=_username_from_admin_name(college_data.admin_name),
        email=admin_email,
        password_hash=hash_password(college_data.admin_password),
        role=UserRole.ADMIN,
        is_active=False  # Not active until college is approved
    )
    db.add(admin_user)
    db.flush()  # Get the user ID
    
    # Create profile for the user
    profile = Profile(
        user_id=admin_user.id,
        full_name=college_data.admin_name,
    )
    db.add(profile)
    db.flush()
    
    # Create the college request linked to this user
    db_request = CollegeRequest(
        name=college_data.name,
        domain=domain,
        location=college_data.location,
        established_year=college_data.established_year,
        description=college_data.description,
        admin_name=college_data.admin_name,
        admin_email=admin_email,
        requested_by=admin_user.id,  # Link to the created user
        status=CollegeRequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_college_request(db: Session, request_id: int) -> CollegeRequest | None:
    """Get a college request by ID."""
    return db.query(CollegeRequest).filter(
        CollegeRequest.id == request_id
    ).first()


def list_college_requests_for_super_admin(
    db: Session,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100
) -> list[CollegeRequest]:
    """
    List college requests for SUPER_ADMIN.
    
    Args:
        db: Database session
        status: Filter by status (optional)
        skip: Pagination offset
        limit: Pagination limit
    
    Returns:
        List of CollegeRequest objects
    """
    query = db.query(CollegeRequest)
    
    if status:
        query = query.filter(CollegeRequest.status == status)
    
    return query.order_by(CollegeRequest.created_at.desc()).offset(skip).limit(limit).all()


def approve_college_request(
    db: Session,
    request_id: int,
    reviewer_id: int
) -> CollegeRequest:
    """
    Approve a college request and create the college.
    
    Activates the existing admin user and links them to the new college.
    College is marked as APPROVED and admin can login immediately.
    
    SECURITY:
    - Only SUPER_ADMIN can call this
    - Request must be PENDING
    - User must exist (created during request)
    
    Args:
        db: Database session
        request_id: ID of request to approve
        reviewer_id: ID of user approving (should be SUPER_ADMIN)
    
    Returns:
        Updated CollegeRequest object
    
    Raises:
        ValueError: If security checks fail
    """
    college_req = get_college_request(db, request_id)
    if not college_req:
        raise ValueError("Request not found.")
    
    # Security: Can only approve PENDING requests
    if college_req.status != CollegeRequestStatus.PENDING:
        raise ValueError(f"Cannot approve request with status '{college_req.status}'.")
    
    # Get the admin user who requested this college
    if not college_req.requested_by:
        raise ValueError("Request does not have an associated user.")
    
    admin_user = db.query(User).filter(User.id == college_req.requested_by).first()
    if not admin_user:
        raise ValueError("Requested admin user not found.")
    
    existing_college = db.query(College).filter(
        func.lower(College.domain) == college_req.domain.lower()
    ).first()
    if existing_college:
        raise ValueError("Domain already in use by an existing college.")

    # Create the college with is_approved=True
    new_college = College(
        name=college_req.name,
        domain=college_req.domain,
        location=college_req.location,
        established_year=college_req.established_year,
        description=college_req.description,
        is_approved=True  # College is approved and can accept users
    )
    db.add(new_college)
    db.flush()  # Flush to get the college ID
    
    # Activate the existing admin user and link to college
    admin_user.is_active = True
    admin_user.college_id = new_college.id
    
    # Update the user's profile with college_id
    profile = db.query(Profile).filter(Profile.user_id == admin_user.id).first()
    if profile:
        profile.college_id = new_college.id
    
    # Update request
    college_req.status = CollegeRequestStatus.APPROVED
    college_req.reviewed_by = reviewer_id
    college_req.reviewed_at = func.now()
    college_req.college_id = new_college.id
    
    db.commit()
    db.refresh(college_req)

    # Log approval
    print(f"[COLLEGE_APPROVED] College: {new_college.name}, Admin Email: {admin_user.email}")

    return college_req


def reject_college_request(
    db: Session,
    request_id: int,
    reviewer_id: int,
    rejection_reason: str | None = None
) -> CollegeRequest:
    """
    Reject a college request.
    
    SECURITY:
    - Only SUPER_ADMIN can call this
    - Request must be PENDING
    
    Args:
        db: Database session
        request_id: ID of request to reject
        reviewer_id: ID of user rejecting (should be SUPER_ADMIN)
        rejection_reason: Optional reason for rejection
    
    Returns:
        Updated CollegeRequest object
    
    Raises:
        ValueError: If security checks fail
    """
    college_req = get_college_request(db, request_id)
    if not college_req:
        raise ValueError("Request not found.")
    
    # Security: Can only reject PENDING requests
    if college_req.status != CollegeRequestStatus.PENDING:
        raise ValueError(f"Cannot reject request with status '{college_req.status}'.")
    
    college_req.status = CollegeRequestStatus.REJECTED
    college_req.reviewed_by = reviewer_id
    college_req.reviewed_at = func.now()
    college_req.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(college_req)
    
    # Log rejection (no email sending)
    print(f"[COLLEGE_REJECTED] College request ID: {request_id}, Reason: {rejection_reason}")
    
    return college_req


def _domain_from_email(email: str) -> str:
    try:
        return email.rsplit("@", 1)[1].lower()
    except IndexError:
        raise ValueError("Admin email must contain a valid domain.")


def _username_from_admin_name(admin_name: str) -> str:
    username = re.sub(r"[^a-zA-Z0-9_]+", "_", admin_name.strip().lower()).strip("_")
    return username or "admin"
