from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session, contains_eager, joinedload
from sqlalchemy import or_, and_, func, desc
from datetime import datetime
from typing import Annotated

from src.database.session import get_db
from src.models.user import User, UserRole, AlumniStatus
from src.models.college import College
from src.models.college_request import CollegeRequest, CollegeRequestStatus
from src.models.college_branding import CollegeBranding
from src.models.profile import Profile
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment
from src.models.connection import Connection
from src.models.message import Message
from src.models.notification import Notification
from src.schemas.admin_management import (
    PlatformOverviewResponse,
    AdminCollegeItem,
    AdminCollegeUser,
    AdminUserItem,
    UserStatusUpdate,
    UserRoleUpdate,
    CollegeStatusUpdate,
)
from src.utils.dependency import get_current_user
from src.utils.rbac import require_super_admin

router = APIRouter()


def require_admin_or_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Super Admin privileges required",
        )
    return current_user


# ==========================================
# SUPER ADMIN PLATFORM OVERVIEW
# ==========================================
@router.get("/platform-overview", response_model=PlatformOverviewResponse)
def get_platform_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    total_colleges = db.query(College).count()
    active_colleges = db.query(College).filter(
        College.is_active == True,
        College.is_approved == True
    ).count()
    pending_requests = db.query(CollegeRequest).filter(
        CollegeRequest.status == CollegeRequestStatus.PENDING
    ).count()

    role_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    role_map = {r: c for r, c in role_counts}
    alumni_count = role_map.get(UserRole.ALUMNI, 0)
    student_count = role_map.get(UserRole.STUDENT, 0)
    total_users = sum(role_map.values())

    # Dynamic recent activity stream
    recent_activity = []

    # 1. Recent College Requests
    recent_requests = (
        db.query(CollegeRequest)
        .order_by(desc(CollegeRequest.created_at))
        .limit(10)
        .all()
    )
    for req in recent_requests:
        status_val = req.status.value if hasattr(req.status, "value") else str(req.status)
        recent_activity.append({
            "id": f"req_{req.id}",
            "type": "college_request",
            "title": f"College Request: {req.name}",
            "description": f"Requested by {req.admin_name} ({req.admin_email})",
            "status": status_val,
            "timestamp": (req.reviewed_at or req.created_at or datetime.utcnow()).isoformat(),
        })

    # 2. Recent Colleges
    recent_colleges = (
        db.query(College)
        .order_by(desc(College.created_at if College.created_at is not None else College.id))
        .limit(5)
        .all()
    )
    for col in recent_colleges:
        ts = col.created_at.isoformat() if col.created_at else datetime.utcnow().isoformat()
        recent_activity.append({
            "id": f"col_{col.id}",
            "type": "college_onboarded",
            "title": f"College: {col.name}",
            "description": f"Domain: {col.domain} • Location: {col.location or 'N/A'}",
            "status": "active" if col.is_active else "deactivated",
            "timestamp": ts,
        })

    # 3. Recent Registered Users (cross-college, eager load college)
    recent_users = (
        db.query(User)
        .options(joinedload(User.college))
        .order_by(desc(User.created_at if User.created_at is not None else User.id))
        .limit(10)
        .all()
    )
    for u in recent_users:
        if u.role == UserRole.SUPER_ADMIN:
            continue
        col_name = u.college.name if u.college else "Unknown"
        ts = u.created_at.isoformat() if u.created_at else datetime.utcnow().isoformat()
        recent_activity.append({
            "id": f"user_{u.id}",
            "type": "user_registration",
            "title": f"New {u.role.value.capitalize()}: {u.username}",
            "description": f"{u.email} joined {col_name}",
            "status": "active" if u.is_active else "inactive",
            "timestamp": ts,
        })

    # Sort recent activity descending by timestamp
    recent_activity.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "total_colleges": total_colleges,
        "active_colleges": active_colleges,
        "pending_requests": pending_requests,
        "total_users": total_users,
        "alumni_count": alumni_count,
        "student_count": student_count,
        "recent_activity": recent_activity[:15],
    }


# ==========================================
# SUPER ADMIN UNIVERSITIES MANAGEMENT
# ==========================================
@router.get("/colleges", response_model=list[AdminCollegeItem])
def list_admin_colleges(
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    query = db.query(College)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                College.name.ilike(search_term),
                College.slug.ilike(search_term),
                College.domain.ilike(search_term),
                College.location.ilike(search_term),
            )
        )

    if status_filter == "active":
        query = query.filter(College.is_active == True)
    elif status_filter == "deactivated":
        query = query.filter(College.is_active == False)

    colleges = query.order_by(College.id).offset(skip).limit(limit).all()

    result = []
    for c in colleges:
        total_u = db.query(User).filter(User.college_id == c.id).count()
        alumni_u = db.query(User).filter(User.college_id == c.id, User.role == UserRole.ALUMNI).count()
        student_u = db.query(User).filter(User.college_id == c.id, User.role == UserRole.STUDENT).count()

        admin = (
            db.query(User)
            .filter(User.college_id == c.id, User.role == UserRole.ADMIN)
            .first()
        )
        admin_data = None
        if admin:
            admin_data = AdminCollegeUser(
                id=admin.id,
                username=admin.username,
                email=admin.email,
                full_name=admin.profile.full_name if admin.profile else admin.username,
            )

        result.append(
            AdminCollegeItem(
                id=c.id,
                name=c.name,
                slug=c.slug,
                domain=c.domain,
                location=c.location,
                established_year=c.established_year,
                description=c.description,
                is_approved=c.is_approved,
                is_active=c.is_active,
                created_at=c.created_at,
                total_users=total_u,
                alumni_count=alumni_u,
                student_count=student_u,
                admin_user=admin_data,
            )
        )

    return result


@router.patch("/colleges/{college_id}/status", response_model=AdminCollegeItem)
def update_college_status(
    college_id: int,
    payload: CollegeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")

    college.is_active = payload.is_active
    db.commit()
    db.refresh(college)

    total_u = db.query(User).filter(User.college_id == college.id).count()
    alumni_u = db.query(User).filter(User.college_id == college.id, User.role == UserRole.ALUMNI).count()
    student_u = db.query(User).filter(User.college_id == college.id, User.role == UserRole.STUDENT).count()
    admin = db.query(User).filter(User.college_id == college.id, User.role == UserRole.ADMIN).first()

    admin_data = None
    if admin:
        admin_data = AdminCollegeUser(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            full_name=admin.profile.full_name if admin.profile else admin.username,
        )

    return AdminCollegeItem(
        id=college.id,
        name=college.name,
        slug=college.slug,
        domain=college.domain,
        location=college.location,
        established_year=college.established_year,
        description=college.description,
        is_approved=college.is_approved,
        is_active=college.is_active,
        created_at=college.created_at,
        total_users=total_u,
        alumni_count=alumni_u,
        student_count=student_u,
        admin_user=admin_data,
    )


@router.delete("/colleges/{college_id}")
def delete_college(
    college_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")

    if current_user.username == "demo_superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Destructive action blocked: College deletion is disabled in Demo Super Admin mode for platform safety.",
        )

    if college.slug == "nitk":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the primary reference college 'nitk'. You can deactivate it instead.",
        )

    try:
        # Nullify college_id in CollegeRequest
        db.query(CollegeRequest).filter(CollegeRequest.college_id == college.id).update(
            {"college_id": None}
        )

        # Remove college users and dependent records
        college_users = db.query(User).filter(User.college_id == college.id).all()
        for u in college_users:
            db.query(Notification).filter(Notification.user_id == u.id).delete()
            db.query(Comment).filter(Comment.user_id == u.id).delete()
            db.query(Like).filter(Like.user_id == u.id).delete()
            db.query(Post).filter(Post.user_id == u.id).delete()
            db.query(Message).filter(or_(Message.sender_id == u.id, Message.receiver_id == u.id)).delete()
            db.query(Connection).filter(or_(Connection.sender_id == u.id, Connection.receiver_id == u.id)).delete()
            db.query(Profile).filter(Profile.user_id == u.id).delete()
            db.delete(u)

        # Remove branding
        db.query(CollegeBranding).filter(CollegeBranding.college_id == college.id).delete()

        # Delete college
        db.delete(college)
        db.commit()
        return {"message": f"College '{college.name}' and all associated records deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete college: {str(e)}",
        )


# ==========================================
# PLATFORM-WIDE USERS (SUPER ADMIN)
# ==========================================
@router.get("/users", response_model=list[AdminUserItem])
def list_platform_users(
    response: Response = None,
    search: str | None = None,
    college_id: int | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    query = (
        db.query(User)
        .outerjoin(Profile, User.id == Profile.user_id)
        .outerjoin(College, User.college_id == College.id)
        .options(
            contains_eager(User.profile),
            contains_eager(User.college),
        )
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                Profile.full_name.ilike(search_term),
                Profile.company.ilike(search_term),
                Profile.job_title.ilike(search_term),
            )
        )

    if college_id is not None:
        query = query.filter(User.college_id == college_id)

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total_count = query.order_by(None).count()
    if response is not None:
        response.headers["X-Total-Count"] = str(total_count)

    users = query.order_by(User.id).offset(skip).limit(limit).all()

    items = []
    for u in users:
        p = u.profile
        items.append(
            AdminUserItem(
                id=u.id,
                username=u.username,
                email=u.email,
                role=u.role.value if hasattr(u.role, "value") else str(u.role),
                is_active=u.is_active,
                email_verified=u.email_verified,
                college_id=u.college_id,
                college_name=u.college.name if u.college else None,
                college_slug=u.college.slug if u.college else None,
                full_name=p.full_name if p else u.username,
                job_title=p.job_title if p else None,
                company=p.company if p else None,
                major=p.major if p else None,
                grad_year=p.grad_year if p else None,
                location=p.location if p else None,
                created_at=u.created_at,
                profile_picture=p.profile_picture if p else None,
            )
        )

    return items


# ==========================================
# COLLEGE-SCOPED USERS (COLLEGE ADMIN & SUPER ADMIN)
# ==========================================
@router.get("/college-users", response_model=list[AdminUserItem])
def list_college_users(
    response: Response = None,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    query = (
        db.query(User)
        .outerjoin(Profile, User.id == Profile.user_id)
        .outerjoin(College, User.college_id == College.id)
        .options(
            contains_eager(User.profile),
            contains_eager(User.college),
        )
    )

    # Tenant enforcement: College Admin cannot view users outside their college
    if current_user.role == UserRole.ADMIN:
        query = query.filter(User.college_id == current_user.college_id)
        # Exclude super admins
        query = query.filter(User.role != UserRole.SUPER_ADMIN)
    elif current_user.role == UserRole.SUPER_ADMIN:
        # If super admin, could filter if they provide college_id (or all)
        pass

    # Quick institutional counters for headers (if tenant-scoped)
    student_total = 0
    alumni_total = 0
    if current_user.role == UserRole.ADMIN and current_user.college_id:
        role_counts = (
            db.query(User.role, func.count(User.id))
            .filter(User.college_id == current_user.college_id, User.role != UserRole.SUPER_ADMIN)
            .group_by(User.role)
            .all()
        )
        student_total = next((c for r, c in role_counts if r == UserRole.STUDENT), 0)
        alumni_total = next((c for r, c in role_counts if r == UserRole.ALUMNI), 0)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                Profile.full_name.ilike(search_term),
                Profile.company.ilike(search_term),
                Profile.job_title.ilike(search_term),
            )
        )

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total_count = query.order_by(None).count()
    if response is not None:
        response.headers["X-Total-Count"] = str(total_count)
        if current_user.role == UserRole.ADMIN and current_user.college_id:
            response.headers["X-Student-Count"] = str(student_total)
            response.headers["X-Alumni-Count"] = str(alumni_total)

    users = query.order_by(User.id).offset(skip).limit(limit).all()

    items = []
    for u in users:
        p = u.profile
        items.append(
            AdminUserItem(
                id=u.id,
                username=u.username,
                email=u.email,
                role=u.role.value if hasattr(u.role, "value") else str(u.role),
                is_active=u.is_active,
                email_verified=u.email_verified,
                college_id=u.college_id,
                college_name=u.college.name if u.college else None,
                college_slug=u.college.slug if u.college else None,
                full_name=p.full_name if p else u.username,
                job_title=p.job_title if p else None,
                company=p.company if p else None,
                major=p.major if p else None,
                grad_year=p.grad_year if p else None,
                location=p.location if p else None,
                created_at=u.created_at,
                profile_picture=p.profile_picture if p else None,
            )
        )

    return items


# ==========================================
# USER MANAGEMENT MUTATIONS (STATUS, ROLE, DELETE)
# ==========================================
@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot modify your own active status",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # College Admin restrictions:
    # 1. Must be strictly within own college
    # 2. Can only modify student or alumni
    if current_user.role == UserRole.ADMIN:
        if target_user.college_id != current_user.college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage users from another college",
            )
        if target_user.role not in [UserRole.STUDENT, UserRole.ALUMNI]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="College admins can only manage student and alumni accounts",
            )

    target_user.is_active = payload.is_active
    db.commit()
    return {"message": f"User status updated to {'active' if payload.is_active else 'inactive'}", "is_active": target_user.is_active}


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot modify your own role",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    valid_roles = ["super_admin", "admin", "alumni", "student"]
    if payload.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be one of: {valid_roles}",
        )

    # College Admin restrictions:
    # 1. Must be strictly within own college
    # 2. Target must currently be student or alumni
    # 3. New role must be student or alumni (promote to alumni, demote to student)
    if current_user.role == UserRole.ADMIN:
        if target_user.college_id != current_user.college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage users from another college",
            )
        if target_user.role not in [UserRole.STUDENT, UserRole.ALUMNI]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="College admins can only manage student and alumni roles",
            )
        if payload.role not in ["student", "alumni"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="College admins can only switch roles between 'student' and 'alumni'",
            )

    new_role = UserRole(payload.role)
    target_user.role = new_role

    if new_role == UserRole.ALUMNI:
        target_user.alumni_status = AlumniStatus.APPROVED
        target_user.alumni_reviewed_at = datetime.utcnow()
        target_user.reviewed_by_id = current_user.id
    elif new_role == UserRole.STUDENT:
        target_user.alumni_status = AlumniStatus.NOT_REQUESTED

    db.commit()
    return {"message": f"User role updated to {payload.role}", "role": payload.role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete yourself",
        )

    if current_user.username == "demo_superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Destructive action blocked: User deletion is disabled in Demo Super Admin mode for platform safety.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target_user.username in ["demo_student", "demo_alumni", "demo_superadmin", "admin_nitk"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete protected demo account '{target_user.username}'.",
        )

    # College Admin restrictions:
    if current_user.role == UserRole.ADMIN:
        if target_user.college_id != current_user.college_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete users from another college",
            )
        if target_user.role not in [UserRole.STUDENT, UserRole.ALUMNI]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="College admins can only delete student and alumni accounts",
            )

    try:
        # Safe cleanup of user-related records
        db.query(Notification).filter(Notification.user_id == target_user.id).delete()
        db.query(Comment).filter(Comment.user_id == target_user.id).delete()
        db.query(Like).filter(Like.user_id == target_user.id).delete()
        db.query(Post).filter(Post.user_id == target_user.id).delete()
        db.query(Message).filter(or_(Message.sender_id == target_user.id, Message.receiver_id == target_user.id)).delete()
        db.query(Connection).filter(or_(Connection.sender_id == target_user.id, Connection.receiver_id == target_user.id)).delete()
        db.query(Profile).filter(Profile.user_id == target_user.id).delete()

        db.delete(target_user)
        db.commit()
        return {"message": f"User '{target_user.username}' deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}",
        )
