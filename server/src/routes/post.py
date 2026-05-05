from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
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
async def api_create_post(
    # Use 'str | None' instead of 'Optional[str]'
    content: str | None = Form(None), 
    is_opportunity: bool = Form(False),
    # Use 'UploadFile | None' instead of 'Optional[UploadFile]'
    file: UploadFile | None = File(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Pydantic is much better at resolving these native types
        post_data = PostCreate(content=content, is_opportunity=is_opportunity)
        return create_post(db, current_user.id, post_data, image_file=file)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Post creation error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

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