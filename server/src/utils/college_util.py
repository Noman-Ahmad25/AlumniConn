import re
from sqlalchemy.orm import Session
from src.models.college import College

def generate_unique_college_slug(db: Session, college_name: str) -> str:
    base_slug = re.sub(r"[^a-z0-9]+", "-", college_name.lower()).strip("-")
    slug = base_slug
    counter = 1

    while db.query(College).filter(College.slug == slug).first():
        counter += 1
        slug = f"{base_slug}-{counter}"

    return slug