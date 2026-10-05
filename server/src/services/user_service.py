from sqlalchemy import and_, or_, cast, String
from sqlalchemy.orm import Session
from typing import Optional

from src.models.connection import Connection, ConnectionStatus
from src.models.profile import Profile
from src.models.user import User


def get_discover_users(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    major: Optional[str] = None,
    grad_year: Optional[int] = None,
    company: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
) -> list[dict]:
    query = db.query(User, Profile, Connection).outerjoin(
        Profile,
        Profile.user_id == User.id,
    ).outerjoin(
        Connection,
        and_(
            Connection.college_id == current_user.college_id,
            or_(
                and_(
                    Connection.sender_id == current_user.id,
                    Connection.receiver_id == User.id,
                ),
                and_(
                    Connection.sender_id == User.id,
                    Connection.receiver_id == current_user.id,
                ),
            ),
        ),
    ).filter(
        User.college_id == current_user.college_id,
        User.id != current_user.id,
        User.is_active == True,
        or_(
            Connection.id.is_(None),
            Connection.status == ConnectionStatus.PENDING,
            Connection.status == ConnectionStatus.REJECTED,
        ),
    )

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(search_pattern),
                Profile.full_name.ilike(search_pattern),
                Profile.company.ilike(search_pattern),
                Profile.job_title.ilike(search_pattern),
                Profile.location.ilike(search_pattern),
                Profile.major.ilike(search_pattern),
                cast(Profile.skills, String).ilike(search_pattern),
            )
        )

    if major:
        query = query.filter(Profile.major.ilike(f"%{major.strip()}%"))

    if grad_year:
        query = query.filter(Profile.grad_year == grad_year)

    if company:
        query = query.filter(Profile.company.ilike(f"%{company.strip()}%"))

    if location:
        query = query.filter(Profile.location.ilike(f"%{location.strip()}%"))

    if skill:
        query = query.filter(cast(Profile.skills, String).ilike(f"%{skill.strip()}%"))

    rows = query.order_by(User.username.asc()).offset(skip).limit(limit).all()

    discover_users = []
    for user, profile, connection in rows:
        connection_status = "none"
        if connection and connection.status == ConnectionStatus.PENDING:
            if connection.sender_id == current_user.id:
                connection_status = "pending_sent"
            elif connection.receiver_id == current_user.id:
                connection_status = "pending_received"

        discover_users.append({
            "id": user.id,
            "username": user.username,
            "full_name": profile.full_name if profile else None,
            "job_title": profile.job_title if profile else None,
            "company": profile.company if profile else None,
            "location": profile.location if profile else None,
            "profile_picture": profile.profile_picture if profile else None,
            "connection_status": connection_status,
        })

    return discover_users
