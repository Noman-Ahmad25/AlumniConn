from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, ProgrammingError
from datetime import datetime
import os
import sys

from src.models.user import User, UserRole, AlumniStatus
from src.models.profile import Profile
from src.models.college import College
from src.models.college_branding import CollegeBranding
from src.models.college_request import CollegeRequest
from src.models.connection import Connection
from src.models.message import Message
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment
from src.models.notification import Notification
from src.utils.security import hash_password
from src.utils.embedding import generate_semantic_text, compute_semantic_hash, get_embedding
from src.database.seed_data import COLLEGE_DATA, COLLEGE_ADMIN_DATA, SAMPLE_ALUMNI


def seed_super_admin(db: Session):
    """Seed super admin from environment variables."""
    email = os.getenv("SUPER_ADMIN_EMAIL", "admin2@gmail.com")
    username = os.getenv("SUPER_ADMIN_USERNAME", "superadmin")
    password = os.getenv("SUPER_ADMIN_PASSWORD", "noman123")

    if not password:
        raise ValueError("SUPER_ADMIN_PASSWORD environment variable is required!")

    try:
        admin = db.query(User).filter(User.email == email).first()
    except (OperationalError, ProgrammingError) as exc:
        db.rollback()
        print(f"Skipping super admin seed; users table is not ready: {exc}")
        return None

    if not admin:
        new_admin = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            college_id=None,
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        db.add(new_admin)
        try:
            db.commit()
            db.refresh(new_admin)
            print(f"✅ Created Super Admin: {email}")
            return new_admin
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to seed Super Admin: {e}")
            return None
    else:
        print(f"ℹ️ Super Admin {email} already exists. Skipping.")
        return admin


def seed_college(db: Session) -> College | None:
    """Seed default development college."""
    slug = COLLEGE_DATA["slug"]
    college = db.query(College).filter(College.slug == slug).first()
    if not college:
        college = College(
            name=COLLEGE_DATA["name"],
            slug=COLLEGE_DATA["slug"],
            domain=COLLEGE_DATA["domain"],
            location=COLLEGE_DATA["location"],
            established_year=COLLEGE_DATA["established_year"],
            description=COLLEGE_DATA["description"],
            is_approved=COLLEGE_DATA["is_approved"],
        )
        db.add(college)
        try:
            db.commit()
            db.refresh(college)
            print(f"✅ Created College: {college.name} (slug: {college.slug})")

            # Add default branding
            branding = CollegeBranding(
                college_id=college.id,
                primary_color="#0066cc",
                secondary_color="#4d94ff",
                accent_color="#ff9900",
                background_color="#f8f9fa",
                welcome_message=f"Welcome to {college.name} Alumni Network",
                motto="Building Bridges Across Generations",
            )
            db.add(branding)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to seed College: {e}")
            return None
    else:
        print(f"ℹ️ College {college.slug} already exists. Skipping.")
    return college


def seed_college_admin(db: Session, college: College) -> User | None:
    """Seed college admin user."""
    email = COLLEGE_ADMIN_DATA["email"]
    admin = db.query(User).filter(User.email == email, User.college_id == college.id).first()
    if not admin:
        new_admin = User(
            username=COLLEGE_ADMIN_DATA["username"],
            email=email,
            password_hash=hash_password(COLLEGE_ADMIN_DATA["password"]),
            college_id=college.id,
            role=UserRole.ADMIN,
            is_active=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        db.add(new_admin)
        try:
            db.flush()
            profile = Profile(
                user_id=new_admin.id,
                college_id=college.id,
                full_name=COLLEGE_ADMIN_DATA["full_name"],
                job_title=COLLEGE_ADMIN_DATA["job_title"],
                job_industry=COLLEGE_ADMIN_DATA["job_industry"],
                location=COLLEGE_ADMIN_DATA["location"],
                bio=COLLEGE_ADMIN_DATA["bio"],
            )
            db.add(profile)
            db.commit()
            db.refresh(new_admin)
            print(f"✅ Created College Admin: {email}")
            return new_admin
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to seed College Admin: {e}")
            return None
    else:
        print(f"ℹ️ College Admin {email} already exists. Skipping.")
        return admin


def seed_alumni_users(db: Session, college: College, admin_user: User | None = None, target_count: int = 85) -> list[User]:
    """Seed realistic alumni users and precompute embeddings."""
    created_users = []
    items_to_seed = SAMPLE_ALUMNI[:target_count]

    default_password = "DevAlumni@2026!"
    shared_password_hash = hash_password(default_password)

    for idx, item in enumerate(items_to_seed, 1):
        email = item["email"]
        username = item["username"]

        existing = db.query(User).filter(
            (User.email == email) | (User.username == username),
            User.college_id == college.id
        ).first()

        if existing:
            continue

        new_user = User(
            username=username,
            email=email,
            password_hash=shared_password_hash,
            college_id=college.id,
            role=UserRole.ALUMNI,
            is_active=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            alumni_status=AlumniStatus.APPROVED,
            alumni_requested_at=datetime.utcnow(),
            alumni_reviewed_at=datetime.utcnow(),
            reviewed_by_id=admin_user.id if admin_user else None,
            created_at=datetime.utcnow()
        )
        db.add(new_user)
        db.flush()

        # Temporary profile instance to compute semantic text
        temp_profile = Profile(
            user_id=new_user.id,
            college_id=college.id,
            full_name=item["full_name"],
            bio=item["bio"],
            company=item["company"],
            job_title=item["job_title"],
            job_industry=item["job_industry"],
            job_description=item["job_description"],
            location=item["location"],
            skills=item["skills"],
            interests=item["interests"],
            grad_year=item["grad_year"],
            major=item["major"],
        )

        semantic_text = generate_semantic_text(temp_profile)
        semantic_hash = compute_semantic_hash(semantic_text)
        embedding_vec = get_embedding(semantic_text)

        temp_profile.semantic_hash = semantic_hash
        temp_profile.embedding = embedding_vec

        db.add(temp_profile)
        created_users.append(new_user)

        if idx % 20 == 0:
            db.commit()
            print(f"  Processed {idx}/{len(items_to_seed)} alumni profiles...")

    db.commit()
    print(f"✅ Successfully seeded {len(created_users)} realistic alumni profiles into college '{college.slug}'")
    return created_users


def seed_all(db: Session, alumni_count: int = 85):
    """Seed super admin, college, college admin, and alumni users."""
    print("🌱 Starting AlumniConn development database seeding...")
    seed_super_admin(db)
    college = seed_college(db)
    if college:
        admin = seed_college_admin(db, college)
        seed_alumni_users(db, college, admin, target_count=alumni_count)
    print("✨ Seeding completed successfully!")


if __name__ == "__main__":
    from src.database.session import SessionLocal
    db = SessionLocal()
    try:
        seed_all(db, alumni_count=85)
    finally:
        db.close()
