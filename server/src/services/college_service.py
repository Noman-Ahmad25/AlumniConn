
from src.models.college import College
from src.models.college_branding import CollegeBranding
from src.models.user import User, UserRole
from src.models.connection import Connection, ConnectionStatus
from src.models.profile import Profile
from src.models.post import Post
from src.models.message import Message
from src.schemas.college import CollegeCreate, CollegeUpdate
from sqlalchemy.orm import Session
from src.utils.college_util import generate_unique_college_slug

def create_college(db: Session, college: CollegeCreate) -> College:
    # Check if college with same name or domain already exists
    existing_college = db.query(College).filter(
        (College.name == college.name) | (College.domain == college.domain)
    ).first()
    if existing_college:
        raise ValueError("College with the same name or domain already exists.")
    
    slug = generate_unique_college_slug(db, college.name)
    db_college = College(
        name=college.name,
        location=college.location,
        established_year=college.established_year,
        description=college.description,
        domain=college.domain,
        slug= slug
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


def get_college_stats(db: Session, college_id: int) -> dict:
    alumni_count = db.query(User).filter(
        User.college_id == college_id,
        User.role == UserRole.ALUMNI,
        User.is_active == True
    ).count()
    student_count = db.query(User).filter(
        User.college_id == college_id,
        User.role == UserRole.STUDENT,
        User.is_active == True
    ).count()
    connection_count = db.query(Connection).filter(
        Connection.college_id == college_id,
        Connection.status == ConnectionStatus.ACCEPTED
    ).count()
    majors_count = db.query(Profile.major).filter(
        Profile.college_id == college_id,
        Profile.major.isnot(None),
        Profile.major != ""
    ).distinct().count()
    posts_count = db.query(Post).join(User, Post.user_id == User.id).filter(
        User.college_id == college_id
    ).count()

    return {
        "alumni_count": alumni_count,
        "student_count": student_count,
        "connection_count": connection_count,
        "majors_count": majors_count,
        "posts_count": posts_count,
    }


def get_college_public_by_slug(db: Session, slug: str) -> dict | None:
    college = db.query(College).filter(College.slug == slug).first()
    if not college:
        return None
    
    stats = get_college_stats(db, college.id)
    
    branding_data = None
    if college.branding:
        quick_links = college.branding.quick_links if isinstance(college.branding.quick_links, dict) else {}
        testimonials = quick_links.get("testimonials") if quick_links else None
        
        branding_data = {
            "logo_url": college.branding.logo_url,
            "banner_url": college.branding.banner_url,
            "favicon_url": college.branding.favicon_url,
            "primary_color": college.branding.primary_color,
            "secondary_color": college.branding.secondary_color,
            "accent_color": college.branding.accent_color,
            "background_color": college.branding.background_color,
            "typography_preset": college.branding.typography_preset,
            "homepage_layout": college.branding.homepage_layout,
            "welcome_message": college.branding.welcome_message,
            "motto": college.branding.motto,
            "social_links": college.branding.social_links,
            "testimonials": testimonials,
            "quick_links": college.branding.quick_links,
        }

    return {
        "id": college.id,
        "name": college.name,
        "slug": college.slug,
        "location": college.location,
        "established_year": college.established_year,
        "description": college.description,
        "branding": branding_data,
        "stats": stats,
    }


def update_college(db: Session, college_id: int, update_data: CollegeUpdate) -> College:
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise ValueError("College not found")

    if update_data.name is not None:
        college.name = update_data.name
    if update_data.location is not None:
        college.location = update_data.location
    if update_data.established_year is not None:
        college.established_year = update_data.established_year
    if update_data.description is not None:
        college.description = update_data.description

    if update_data.branding is not None:
        branding = college.branding
        if not branding:
            branding = CollegeBranding(college_id=college.id)
            db.add(branding)

        b_data = update_data.branding
        if b_data.logo_url is not None:
            branding.logo_url = b_data.logo_url
        if b_data.banner_url is not None:
            branding.banner_url = b_data.banner_url
        if b_data.favicon_url is not None:
            branding.favicon_url = b_data.favicon_url
        if b_data.primary_color is not None:
            branding.primary_color = b_data.primary_color
        if b_data.secondary_color is not None:
            branding.secondary_color = b_data.secondary_color
        if b_data.accent_color is not None:
            branding.accent_color = b_data.accent_color
        if b_data.background_color is not None:
            branding.background_color = b_data.background_color
        if b_data.typography_preset is not None:
            branding.typography_preset = b_data.typography_preset
        if b_data.homepage_layout is not None:
            branding.homepage_layout = b_data.homepage_layout
        if b_data.welcome_message is not None:
            branding.welcome_message = b_data.welcome_message
        if b_data.motto is not None:
            branding.motto = b_data.motto
        if b_data.social_links is not None:
            branding.social_links = b_data.social_links
        
        current_quick_links = dict(branding.quick_links) if branding.quick_links and isinstance(branding.quick_links, dict) else {}
        if b_data.testimonials is not None:
            current_quick_links["testimonials"] = [t.model_dump() for t in b_data.testimonials]
        if b_data.quick_links is not None:
            for k, v in b_data.quick_links.items():
                if k != "testimonials" or b_data.testimonials is None:
                    current_quick_links[k] = v
        branding.quick_links = current_quick_links

    db.commit()
    db.refresh(college)
    return college


def list_colleges(db: Session, skip: int = 0, limit: int = 100) -> list[College]:
    return db.query(College).offset(skip).limit(limit).all()