from datetime import datetime, timedelta
import logging
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
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType
from src.utils.tokens import generate_verification_token, hash_token, verify_token
from src.utils.dispatcher import AbstractTaskDispatcher
from src.services.email.service import EmailService

logger = logging.getLogger(__name__)

def create_college_request(
    db: Session, 
    college_data: CollegeRequestCreate,
    task_dispatcher: AbstractTaskDispatcher
) -> CollegeRequest:
    """
    Create a new college request.
    
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
    
    existing_user = db.query(User).filter(func.lower(User.email) == admin_email).first()
    if existing_user:
        raise ValueError("Admin email already registered as a user.")
    
    existing_request = db.query(CollegeRequest).filter(
        CollegeRequest.status == CollegeRequestStatus.PENDING,
        (
            (func.lower(CollegeRequest.domain) == domain)
            | (func.lower(CollegeRequest.admin_email) == admin_email)
        )
    ).first()
    if existing_request:
        raise ValueError("This college or admin already has a pending request.")
    
    raw_token = generate_verification_token()
    token_hash = hash_token(raw_token)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    db_request = CollegeRequest(
        name=college_data.name,
        domain=domain,
        location=college_data.location,
        established_year=college_data.established_year,
        description=college_data.description,
        admin_name=college_data.admin_name,
        admin_email=admin_email,
        password_hash=hash_password(college_data.admin_password),
        status=CollegeRequestStatus.PENDING,
        email_verified=False,
        verification_token_hash=token_hash,
        verification_token_expires_at=expires_at
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    task_dispatcher.dispatch(EmailService.send_college_verification, admin_email, raw_token, college_data.name)
    
    return db_request


def verify_college_email(db: Session, token: str) -> bool:
    """
    Verifies the college request's admin email.
    """
    hashed = hash_token(token)
    req = db.query(CollegeRequest).filter(CollegeRequest.verification_token_hash == hashed).first()
    
    if not req:
        return False
        
    if req.verification_token_expires_at and req.verification_token_expires_at < datetime.utcnow():
        return False
        
    req.email_verified = True
    req.email_verified_at = datetime.utcnow()
    req.verification_token_hash = None
    req.verification_token_expires_at = None
    
    db.commit()
    
    event_bus.publish("college_request_email_verified", {
        "request_id": req.id,
        "college_name": req.name
    })
    
    return True


def resend_college_verification(db: Session, request_id: int, task_dispatcher: AbstractTaskDispatcher) -> bool:
    """
    Resends the verification email for an unverified college request.
    """
    req = db.query(CollegeRequest).filter(CollegeRequest.id == request_id).first()
    if not req or req.email_verified:
        return False
        
    raw_token = generate_verification_token()
    req.verification_token_hash = hash_token(raw_token)
    req.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    
    db.commit()
    
    task_dispatcher.dispatch(EmailService.send_college_verification, req.admin_email, raw_token, req.name)
    return True


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
    List verified college requests for SUPER_ADMIN.
    """
    query = db.query(CollegeRequest).filter(CollegeRequest.email_verified == True)
    
    if status:
        query = query.filter(CollegeRequest.status == status)
    
    return query.order_by(CollegeRequest.created_at.desc()).offset(skip).limit(limit).all()

def approve_college_request(
    db: Session,
    request_id: int,
    reviewer_id: int,
    task_dispatcher: AbstractTaskDispatcher,
) -> CollegeRequest:
    """
    Approve a college request and create the college, user, and profile atomically.
    """
    college_req = get_college_request(db, request_id)
    if not college_req:
        raise ValueError("Request not found.")
    
    if college_req.status != CollegeRequestStatus.PENDING:
        raise ValueError(f"Cannot approve request with status '{college_req.status}'.")
        
    if not college_req.email_verified:
        raise ValueError("Cannot approve unverified requests.")
    
    existing_college = db.query(College).filter(
        func.lower(College.domain) == college_req.domain.lower()
    ).first()
    if existing_college:
        raise ValueError("Domain already in use by an existing college.")
        
    existing_user = db.query(User).filter(func.lower(User.email) == college_req.admin_email.lower()).first()
    if existing_user:
        raise ValueError("Admin email already registered as a user.")

    # Begin atomic inserts
    new_college = College(
        name=college_req.name,
        domain=college_req.domain,
        location=college_req.location,
        established_year=college_req.established_year,
        description=college_req.description,
        is_approved=True
    )
    db.add(new_college)
    db.flush()

    logger.info(f'College {new_college.name} Created')
    
    admin_user = User(
        username=_username_from_admin_name(college_req.admin_name),
        email=college_req.admin_email,
        password_hash=college_req.password_hash,
        role=UserRole.ADMIN,
        is_active=True,
        email_verified=True,
        email_verified_at=datetime.utcnow(),
        college_id=new_college.id
    )
    db.add(admin_user)
    db.flush()

    logger.info("Admin Registered")
    
    profile = Profile(
        user_id=admin_user.id,
        college_id=new_college.id,
        full_name=college_req.admin_name,
    )
    db.add(profile)
    
    college_req.status = CollegeRequestStatus.APPROVED
    college_req.reviewed_by_id = reviewer_id
    college_req.reviewed_at = func.now()
    college_req.college_id = new_college.id
    
    db.commit()
    db.refresh(college_req)

    logger.info("college and user are registered")

    task_dispatcher.dispatch(EmailService.send_college_approval_email, new_college.name, new_college.slug)

    # Publish notification AFTER commit — admin_user.id is now guaranteed to exist in the DB.
    event_bus.publish(NotificationType.COLLEGE_REQUEST_APPROVED.value, {
        "recipient_id": admin_user.id,
        "notification_type": NotificationType.COLLEGE_REQUEST_APPROVED,
        "title": "College Request Approved",
        "message": f"Your request to add {new_college.name} has been approved.",
        "actor_id": reviewer_id,
        "metadata_": {"request_id": college_req.id, "college_id": new_college.id}
    })

    return college_req



def reject_college_request(
    db: Session,
    request_id: int,
    reviewer_id: int,
    rejection_reason: str | None = None,
    task_dispatcher: AbstractTaskDispatcher,
) -> CollegeRequest:
    """
    Reject a college request.
    """
    college_req = get_college_request(db, request_id)
    if not college_req:
        raise ValueError("Request not found.")
    
    if college_req.status != CollegeRequestStatus.PENDING:
        raise ValueError(f"Cannot reject request with status '{college_req.status}'.")
    
    college_req.status = CollegeRequestStatus.REJECTED
    college_req.reviewed_by_id = reviewer_id
    college_req.reviewed_at = func.now()
    college_req.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(college_req)
    
    logger.info("[COLLEGE_REJECTED] College request ID: %s, Reason: %s", request_id, rejection_reason)
    
    # We do not have a User to notify yet, so no in-app notification can be sent via WebSockets.
    # We can send an email via EventBus in a future iteration.
    task_dispatcher.dispatch(EmailService.send_college_rejection_email, college_req.c, rejection_reason)
    return college_req


def _domain_from_email(email: str) -> str:
    try:
        return email.rsplit("@", 1)[1].lower()
    except IndexError:
        raise ValueError("Admin email must contain a valid domain.")


def _username_from_admin_name(admin_name: str) -> str:
    username = re.sub(r"[^a-zA-Z0-9_]+", "_", admin_name.strip().lower()).strip("_")
    return username or "admin"
