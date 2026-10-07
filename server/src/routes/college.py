from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Annotated
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.models.college import College
from src.models.user import User, UserRole
from src.schemas.college import CollegeCreate, CollegeUpdate, CollegeResponse, CollegePublicResponse
from src.services import college_service
from src.utils.dependency import get_current_user
from src.utils.rbac import require_super_admin

router = APIRouter()

@router.post("/", response_model=CollegeResponse, status_code=status.HTTP_201_CREATED)
def create_college(
    college: CollegeCreate,
    current_user = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    try:
        return college_service.create_college(db, college)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=list[CollegeResponse], status_code=status.HTTP_200_OK)
def list_colleges(skip: Annotated[int, Query(ge=0)] = 0, limit: int = Query(default=100, gt=0, le=100), db: Session = Depends(get_db)):
    return college_service.list_colleges(db, skip, limit)

@router.get("/slug/{slug}", response_model=CollegePublicResponse, status_code=status.HTTP_200_OK)
def get_college_by_slug(slug: str, db: Session = Depends(get_db)):    
    college = college_service.get_college_public_by_slug(db, slug)
    if not college:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")
    return college

@router.get("/domain/{domain}", response_model=CollegeResponse, status_code=status.HTTP_200_OK)
def get_college_by_domain(domain: str, db: Session = Depends(get_db)):    
    college = college_service.get_college_by_domain(db, domain)
    if not college:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")
    return college

@router.get("/{college_id}", response_model=CollegeResponse, status_code=status.HTTP_200_OK)
def get_college(college_id: int, db: Session = Depends(get_db)):    
    college = college_service.get_college_by_id(db, college_id)
    if not college:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")
    return college

@router.patch("/{college_id}", response_model=CollegeResponse, status_code=status.HTTP_200_OK)
def update_college(
    college_id: int,
    college_update: CollegeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.SUPER_ADMIN and (current_user.role != UserRole.ADMIN or current_user.college_id != college_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this college."
        )
    try:
        return college_service.update_college(db, college_id, college_update)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))