from src.models.like import Like
from src.models.user import User
from src.models.post import Post

from sqlalchemy.orm import Session
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType

def toggle_like(db: Session, user: User, post_id: int):
    #check post exists and same college

    post = db.query(Post).join(User).filter(
        Post.id == post_id,
        User.college_id == user.college_id
    ).first()
    if not post:
        raise ValueError("Post not found or not in the same college")
    
    existing_like = db.query(Like).filter_by(user_id=user.id, post_id=post_id).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        return None

    new_like = Like(user_id=user.id, post_id=post_id)
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    
    if post.author_id != user.id:
        event_bus.publish(NotificationType.POST_LIKED.value, {
            "recipient_id": post.author_id,
            "notification_type": NotificationType.POST_LIKED,
            "title": "New Like",
            "message": f"{user.username} liked your post.",
            "actor_id": user.id,
            "metadata_": {"post_id": post.id}
        })

    return new_like