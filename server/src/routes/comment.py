from fastapi import APIRouter, Depends, HTTPException
from src.schemas.comment import CommentCreate, CommentResponse
from sqlalchemy.orm import Session

from src.models.comment import Comment
from src.models.user import User
from src.services.comment_service import create_comment, get_comments, delete_comment
from src.utils.dependency import get_current_user
from src.database.session import get_db

router = APIRouter()

@router.post("/", response_model=CommentResponse)
def create_new_comment(comment_data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        comment = create_comment(db, current_user, comment_data.content, comment_data.post_id)
        return comment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{post_id}", response_model=list[CommentResponse])
def get_comments_for_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = get_comments(db, post_id, current_user)
    return comments
    

@router.delete("/{comment_id}")
def delete_existing_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        delete_comment(db, current_user, comment_id)
        return {"message": "Comment deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
