
from src.models.college import College
from src.schemas.college import CollegeCreate
from sqlalchemy.orm import Session


def create_college(db: Session, college: CollegeCreate) -> College:
    # Check if college with same name or domain already exists
    existing_college = db.query(College).filter(
        (College.name == college.name) | (College.domain == college.domain)
    ).first()
    if existing_college:
        raise ValueError("College with the same name or domain already exists.")
    
    db_college = College(
        name=college.name,
        location=college.location,
        established_year=college.established_year,
        description=college.description,
        domain=college.domain
    )
    db.add(db_college)
    db.commit()
    db.refresh(db_college)
    return db_college


def get_college_by_id(db: Session, college_id: int) -> College | None:
    return db.query(College).filter(College.id == college_id).first()


def get_college_by_domain(db: Session, domain: str) -> College | None:
    return db.query(College).filter(College.domain == domain).first()

def get_college_by_slug(db: Session, slug: str) -> College | None:
    return db.query(College).filter(College.slug == slug).first()


def list_colleges(db: Session, skip: int = 0, limit: int = 100) -> list[College]:
    return db.query(College).offset(skip).limit(limit).all()