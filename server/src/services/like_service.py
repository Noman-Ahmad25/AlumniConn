from src.models.like import Like
from src.models.user import User
from src.models.post import Post

from sqlalchemy.orm import Session

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

    return new_like