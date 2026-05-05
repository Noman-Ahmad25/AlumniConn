from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import joinedload

from src.database.session import get_db
from src.utils.security import decode_access_token
from src.models.user import User, UserRole
from src.models.post import Post
from src.models.profile import Profile
from src.models.like import Like
from src.models.comment import Comment
from src.models.connection import Connection, ConnectionStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")
    college_id = payload.get("college_id")
    role_claim = payload.get("role")

    if user_id is None or role_claim is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        token_role = UserRole(role_claim)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

    query = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id)
    if token_role == UserRole.SUPER_ADMIN:
        query = query.filter(User.role == UserRole.SUPER_ADMIN)
    else:
        if college_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        query = query.filter(User.college_id == college_id)

    user = query.first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return user


def get_connection_status(db: Session, user1_id: int, user2_id: int) -> str:
    """Get connection status between two users. Returns: 'self' | 'none' | 'pending' | 'connected'"""
    if user1_id == user2_id:
        return "self"
    
    conn = db.query(Connection).filter(
        or_(
            and_(Connection.sender_id == user1_id, Connection.receiver_id == user2_id),
            and_(Connection.sender_id == user2_id, Connection.receiver_id == user1_id)
        )
    ).first()
    
    if not conn:
        return "none"
    
    if conn.status == ConnectionStatus.ACCEPTED:
        return "connected"
    elif conn.status == ConnectionStatus.PENDING:
        return "pending"
    else:  # REJECTED
        return "none"


def format_post(db: Session, post: Post, current_user: User):
    user = db.query(User).filter(User.id == post.user_id).first()
    if not user:
        return None  # Skip if user is deleted
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    likes_count = db.query(func.count(Like.id)).filter(
        Like.post_id == post.id
    ).scalar()

    comments_count = db.query(func.count(Comment.id)).filter(
        Comment.post_id == post.id
    ).scalar()

    liked = db.query(Like).filter(
        Like.post_id == post.id,
        Like.user_id == current_user.id
    ).first()

    connection_status = get_connection_status(db, current_user.id, post.user_id)

    return {
        "id": post.id,
        "user_id": post.user_id,
        "username": user.username,
        "profile_picture": profile.profile_picture if profile else None,
        "content": post.content,
        "image_url": post.image_url,
        "is_opportunity": post.is_opportunity,
        "created_at": post.created_at,
        "likes_count": likes_count or 0,
        "comments_count": comments_count or 0,
        "liked_by_current_user": bool(liked),
        "connection_status": connection_status
    }


def format_posts_bulk(rows, like_counts, comment_counts, liked_posts, current_user_id: int, db: Session):
    result = []

    for post, user, profile in rows:
        connection_status = get_connection_status(db, current_user_id, post.user_id)
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "username": user.username,
            "profile_picture": profile.profile_picture if profile else None,
            "content": post.content,
            "image_url": post.image_url,
            "is_opportunity": post.is_opportunity,
            "created_at": post.created_at,
            "likes_count": like_counts.get(post.id, 0),
            "comments_count": comment_counts.get(post.id, 0),
            "liked_by_current_user": post.id in liked_posts,
            "connection_status": connection_status
        })

    return result


def format_connection(conn, current_user):
    other_user = (
        conn.receiver if conn.sender_id == current_user.id
        else conn.sender
    )
    if not other_user:
        return None  # Skip if user is deleted
    return {
        "id": conn.id,
        "status": conn.status,
        "user": {
            "id": other_user.id,
            "username": other_user.username,
            "profile_pic_url": other_user.profile.profile_picture
            if other_user.profile else None
        }
    }
