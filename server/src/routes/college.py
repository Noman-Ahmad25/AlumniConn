from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.models.college import College
from src.schemas.college import CollegeCreate, CollegeResponse, CollegePublicResponse
from src.services import college_service

router = APIRouter()

@router.post("/", response_model=CollegeResponse, status_code=status.HTTP_201_CREATED)
def create_college(college: CollegeCreate, db: Session = Depends(get_db)):
    try:
        return college_service.create_college(db, college)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=list[CollegeResponse], status_code=status.HTTP_200_OK)
def list_colleges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return college_service.list_colleges(db, skip, limit)

@router.get("/slug/{slug}", response_model=CollegePublicResponse, status_code=status.HTTP_200_OK)
def get_college_by_slug(slug: str, db: Session = Depends(get_db)):    
    college = college_service.get_college_by_slug(db, slug)
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