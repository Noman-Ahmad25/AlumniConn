from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.schemas.post import PostCreate, PostResponse
from src.services.post_service import (
    create_post,
    get_feed,
    get_user_posts,
    get_other_user_posts,
    delete_post
)
from src.utils.dependency import get_current_user
from src.database.session import get_db
from src.models.user import User

router = APIRouter()

@router.post("/", response_model=PostResponse)
def create_new_post(post_data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        post = create_post(db, current_user.id, post_data)
        return post
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) 
    

@router.get("/feed", response_model=list[PostResponse])
def get_user_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_feed(db, current_user)

@router.get("/me", response_model=list[PostResponse])
def get_my_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_posts(db, current_user)

@router.get("/user/{user_id}", response_model=list[PostResponse])
def get_posts_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get posts from a specific user (filtered by college)"""
    return get_other_user_posts(db, user_id, current_user)

@router.delete("/{post_id}", response_model=dict)
def delete_post_by_id(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = delete_post(db, post_id, current_user)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not authorized to delete")
    return {"detail": "Post deleted successfully"}