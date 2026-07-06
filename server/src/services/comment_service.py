from src.models.comment import Comment
from src.models.user import User
from src.models.post import Post
from src.models.profile import Profile


from sqlalchemy.orm import Session
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType

def create_comment(db: Session, current_user: User, content: str, post_id: int):
    post = db.query(Post).join(User).filter(
        Post.id == post_id,
        User.college_id == current_user.college_id,
    ).first()
    if not post:
        raise ValueError("Post not found or not in the same college")

    comment = Comment(
        user_id=current_user.id,
        content=content,
        post_id=post_id
        
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    if post.author_id != current_user.id:
        event_bus.publish(NotificationType.POST_COMMENTED.value, {
            "recipient_id": post.author_id,
            "notification_type": NotificationType.POST_COMMENTED,
            "title": "New Comment",
            "message": f"{current_user.username} commented on your post.",
            "actor_id": current_user.id,
            "metadata_": {"post_id": post.id, "comment_id": comment.id}
        })

    # 🔥 Fetch enriched data (same structure as get_comments)
    row = db.query(Comment, User, Profile).join(
        User, Comment.user_id == User.id
    ).outerjoin(
        Profile, Profile.user_id == User.id
    ).filter(
        Comment.id == comment.id
    ).first()

    comment, user, profile = row

    return {
        "id": comment.id,
        "user_id": comment.user_id,
        "post_id": comment.post_id,
        "username": user.username,
        "profile_picture": profile.profile_picture if profile else None,
        "content": comment.content,
        "created_at": comment.created_at
    }

def get_comments(db: Session, post_id: int, current_user: User):
    rows = db.query(Comment, User, Profile).join(
        User, Comment.user_id == User.id
    ).join(
        Post, Comment.post_id == Post.id
    ).outerjoin(
        Profile, Profile.user_id == User.id
    ).filter(
        Comment.post_id == post_id,
        User.college_id == current_user.college_id,
    ).order_by(Comment.created_at.asc()).all()  

    result = []

    for comment, user, profile in rows:
        result.append({ 
                "id": comment.id,
                "user_id": comment.user_id,
                "post_id": comment.post_id,
                "username": user.username,
                "profile_picture": profile.profile_picture if profile else None,
                "content": comment.content,
                "created_at": comment.created_at
        })

    return result


def delete_comment(db: Session, user: User, comment_id: int):
    comment = db.query(Comment).join(Post).join(User).filter(
        Comment.id == comment_id,
        User.college_id == user.college_id,
        Comment.user_id == user.id
    ).first()

    if not comment:
        raise ValueError("Comment not found, not in the same college, or you don't have permission to delete it")

    db.delete(comment)
    db.commit()
