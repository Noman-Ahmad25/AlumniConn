from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from src.models.connection import Connection, ConnectionStatus
from src.models.profile import Profile
from src.models.user import User


def get_discover_users(db: Session, current_user: User) -> list[dict]:
    rows = db.query(User, Profile, Connection).outerjoin(
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
        or_(
            Connection.id.is_(None),
            Connection.status == ConnectionStatus.PENDING,
        ),
    ).order_by(User.username.asc()).all()

    discover_users = []
    for user, profile, connection in rows:
        connection_status = "none"
        if connection and connection.sender_id == current_user.id:
            connection_status = "pending_sent"
        elif connection and connection.receiver_id == current_user.id:
            connection_status = "pending_received"

        discover_users.append({
            "id": user.id,
            "username": user.username,
            "profile_picture": profile.profile_picture if profile else None,
            "connection_status": connection_status,
        })

    return discover_users
