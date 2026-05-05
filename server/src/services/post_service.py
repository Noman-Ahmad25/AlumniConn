from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import UploadFile
from src.services.cloudinary_service import upload_image
from src.schemas.post import PostCreate
from src.models.post import Post
from src.models.user import User
from src.models.like import Like
from src.models.profile import Profile
from src.models.comment import Comment
from src.utils.dependency import format_post, format_posts_bulk


def create_post(db: Session, user_id: int, data: PostCreate, image_file: Optional[UploadFile] = None):
    final_image_url = None

    # Handle Cloudinary Upload
    if image_file:
        final_image_url = upload_image(image_file, folder="alumniconn/posts")

    # Validation: Must have text OR an uploaded image
    if not data.content and not final_image_url:
        raise ValueError("Post must have content or an image file")

    post = Post(
        user_id=user_id,
        content=data.content,
        image_url=final_image_url, # Stores the Cloudinary HTTPS link
        is_opportunity=data.is_opportunity
    )

    db.add(post)
    db.commit()
    db.refresh(post)
    
    current_user = db.query(User).filter(User.id == user_id).first()
    return format_post(db, post, current_user)
   


def get_feed(db: Session, current_user: User):
    # Join posts with users and profiles to get necessary info for feed
    rows = db.query(Post, User, Profile).join(
        User, Post.user_id == User.id
    ).outerjoin(
        Profile, Profile.user_id == User.id
    ).filter(
        User.college_id == current_user.college_id
    ).order_by(Post.created_at.desc()).all()

    if not rows:
        return []
    
    posts = [row[0] for row in rows]
    post_ids = [post.id for post in posts]

    # Get like counts for all posts in feed
    like_counts = dict(db.query(Like.post_id, func.count(Like.id)).filter(
        Like.post_id.in_(post_ids)
    ).group_by(Like.post_id).all())

    # Get comment counts for all posts in feed
    comment_counts = dict(db.query(Comment.post_id, func.count(Comment.id)).filter(
        Comment.post_id.in_(post_ids)
    ).group_by(Comment.post_id).all())


    liked_posts = set(
        pid for (pid,) in  db.query(Like.post_id).filter(
        Like.post_id.in_(post_ids),
        Like.user_id == current_user.id
    ).all())

    return format_posts_bulk(rows, like_counts, comment_counts, liked_posts, current_user.id, db)
    

def get_user_posts(db: Session, current_user: User):
    # Similar to get_feed but filtered to just the current user's posts
    rows = db.query(Post, User, Profile).join(
        User, Post.user_id == User.id
    ).outerjoin(
        Profile, Profile.user_id == User.id
    ).filter(
        Post.user_id == current_user.id,
        User.college_id == current_user.college_id
    ).order_by(Post.created_at.desc()).all()

    if not rows:
        return []
    
    posts = [row[0] for row in rows]
    post_ids = [post.id for post in posts]

    like_counts = dict(db.query(Like.post_id, func.count(Like.id)).filter(
        Like.post_id.in_(post_ids)
    ).group_by(Like.post_id).all())

    comment_counts = dict(db.query(Comment.post_id, func.count(Comment.id)).filter(
        Comment.post_id.in_(post_ids)
    ).group_by(Comment.post_id).all())


    liked_posts = set(
        pid for (pid,) in  db.query(Like.post_id).filter(
        Like.post_id.in_(post_ids),
        Like.user_id == current_user.id
    ).all())

    return format_posts_bulk(rows, like_counts, comment_counts, liked_posts, current_user.id, db)


def get_other_user_posts(db: Session, target_user_id: int, current_user: User):
    """Get posts from another user (filtered by college)"""
    rows = db.query(Post, User, Profile).join(
        User, Post.user_id == User.id
    ).outerjoin(
        Profile, Profile.user_id == User.id
    ).filter(
        Post.user_id == target_user_id,
        User.college_id == current_user.college_id
    ).order_by(Post.created_at.desc()).all()

    if not rows:
        return []
    
    posts = [row[0] for row in rows]
    post_ids = [post.id for post in posts]

    like_counts = dict(db.query(Like.post_id, func.count(Like.id)).filter(
        Like.post_id.in_(post_ids)
    ).group_by(Like.post_id).all())

    comment_counts = dict(db.query(Comment.post_id, func.count(Comment.id)).filter(
        Comment.post_id.in_(post_ids)
    ).group_by(Comment.post_id).all())

    liked_posts = set(
        pid for (pid,) in  db.query(Like.post_id).filter(
        Like.post_id.in_(post_ids),
        Like.user_id == current_user.id
    ).all())

    return format_posts_bulk(rows, like_counts, comment_counts, liked_posts, current_user.id, db)


def delete_post(db: Session, post_id: int, current_user: User):
    post = db.query(Post).join(User).filter(
        Post.id == post_id,
        Post.user_id == current_user.id,
        User.college_id == current_user.college_id
    ).first()

    if not post:
        raise ValueError("Post not found or not authorized to delete")

    db.delete(post)
    db.commit()

    return post