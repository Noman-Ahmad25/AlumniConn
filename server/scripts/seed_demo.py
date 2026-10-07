"""AlumniConn Showcase & Realistic Demo Data Seeder.

Provides a unified, idempotent, and production-safe entry point to populate the AlumniConn
database with a vibrant, multi-tenant university and alumni network.

Usage:
    PYTHONPATH=. .venv/bin/python -m scripts.seed_demo
    PYTHONPATH=. .venv/bin/python -m scripts.seed_demo --reset
"""

import sys
import os
import argparse
from datetime import datetime, timedelta
import random
import base64
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import text, or_

# Ensure server package path is available
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.session import SessionLocal
from src.models.user import User, UserRole, AlumniStatus
from src.models.profile import Profile
from src.models.college import College
from src.models.college_branding import CollegeBranding
from src.models.college_request import CollegeRequest, CollegeRequestStatus
from src.models.connection import Connection, ConnectionStatus
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.post import Post
from src.models.like import Like
from src.models.comment import Comment
from src.models.notification import Notification, NotificationType

from src.utils.security import hash_password
from src.utils.embedding import generate_semantic_text, compute_semantic_hash, get_embedding
from src.database.seed_data import COLLEGE_DATA, COLLEGE_ADMIN_DATA, SAMPLE_ALUMNI
from scripts.demo_content import (
    SECONDARY_COLLEGES,
    COLLEGE_REQUESTS_DATA,
    ADDITIONAL_NITK_STUDENTS,
    NITK_POSTS_DATA,
    NITK_COMMENTS_MAP,
    NITK_CONVERSATIONS_DATA,
)

DEMO_PASSWORD_HASH = hash_password("DevAlumni@2026!")
ADMIN_PASSWORD_HASH = hash_password("Admin@Alumni2026!")

SHOWCASE_COLLEGE_SLUGS = [
    "nitk",
    "apex-institute",
    "crestview-university",
    "solaris-tech",
    "bits-pilani",
    "iit-bombay",
    "dtu",
]

SHOWCASE_REQUEST_DOMAINS = [
    "meridianstate.edu",
    "vanguardtutorial.fake",
    "vit.ac.in",
    "manipal.edu",
    "apexglobaltech.fake",
]


# =====================================================================
# CLOUDINARY DEMO ASSET UPLOADER
# =====================================================================

def upload_synthetic_showcase_images() -> List[str]:
    """Uploads high-quality SVG demo graphics to Cloudinary if configured, returning secure URLs."""
    import os
    from dotenv import load_dotenv
    load_dotenv(".env")

    cname = os.getenv("CLOUDINARY_CLOUD_NAME")
    ckey = os.getenv("CLOUDINARY_API_KEY")
    csecret = os.getenv("CLOUDINARY_API_SECRET")

    fallback_images = [
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",  # Tech conference
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",  # Code & architecture
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",  # Campus & graduates
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",  # Hardware & robotics
    ]

    if not (cname and ckey and csecret):
        print("ℹ️ Cloudinary credentials not fully configured. Using fallback showcase image URLs.")
        return fallback_images

    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=cname,
            api_key=ckey,
            api_secret=csecret,
            secure=True,
        )

        svg_templates = [
            (
                "chronocache_arch",
                b'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">'
                b'<rect width="800" height="450" fill="#0f172a"/>'
                b'<rect x="40" y="40" width="720" height="370" rx="16" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>'
                b'<text x="400" y="100" fill="#60a5fa" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">ChronoCache: Distributed Raft Memory Tier</text>'
                b'<rect x="90" y="160" width="160" height="120" rx="10" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>'
                b'<text x="170" y="210" fill="#ffffff" font-family="sans-serif" font-size="16" text-anchor="middle">Leader (Node 1)</text>'
                b'<text x="170" y="240" fill="#93c5fd" font-family="sans-serif" font-size="12" text-anchor="middle">Raft Log / Lease</text>'
                b'<rect x="320" y="160" width="160" height="120" rx="10" fill="#0f766e" stroke="#2dd4bf" stroke-width="1.5"/>'
                b'<text x="400" y="210" fill="#ffffff" font-family="sans-serif" font-size="16" text-anchor="middle">Follower (Node 2)</text>'
                b'<text x="400" y="240" fill="#99f6e4" font-family="sans-serif" font-size="12" text-anchor="middle">Consistent Hash Ring</text>'
                b'<rect x="550" y="160" width="160" height="120" rx="10" fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>'
                b'<text x="630" y="210" fill="#ffffff" font-family="sans-serif" font-size="16" text-anchor="middle">Follower (Node 3)</text>'
                b'<text x="630" y="240" fill="#d1d5db" font-family="sans-serif" font-size="12" text-anchor="middle">TinyLFU Eviction</text>'
                b'<text x="400" y="360" fill="#10b981" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">185k ops/sec sub-ms p99 latency verified in benchmarks</text>'
                b'</svg>'
            ),
            (
                "formula_student_ev",
                (
                    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">'
                    '<rect width="800" height="450" fill="#18181b"/>'
                    '<rect x="40" y="40" width="720" height="370" rx="16" fill="#27272a" stroke="#e11d48" stroke-width="2"/>'
                    '<text x="400" y="90" fill="#fb7185" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">Team NITK Racing: Electric Powertrain 2026</text>'
                    '<circle cx="250" cy="240" r="70" fill="#09090b" stroke="#f43f5e" stroke-width="4"/>'
                    '<circle cx="550" cy="240" r="70" fill="#09090b" stroke="#f43f5e" stroke-width="4"/>'
                    '<path d="M 200 240 Q 400 130 600 240" stroke="#f43f5e" stroke-width="6" fill="none"/>'
                    '<rect x="330" y="210" width="140" height="60" rx="8" fill="#e11d48"/>'
                    '<text x="400" y="245" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">72V LiFePO4</text>'
                    '<text x="400" y="360" fill="#fecdd3" font-family="sans-serif" font-size="15" text-anchor="middle">45kg Downforce @ 60 km/h - High Torsional Rigidity</text>'
                    '</svg>'
                ).encode("utf-8")
            ),
            (
                "alumni_conclave_banner",
                (
                    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">'
                    '<rect width="800" height="450" fill="#0c4a6e"/>'
                    '<rect x="40" y="40" width="720" height="370" rx="16" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>'
                    '<text x="400" y="110" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">NITK Global Alumni Conclave 2026</text>'
                    '<text x="400" y="160" fill="#bae6fd" font-family="sans-serif" font-size="18" text-anchor="middle">Surathkal Campus - December 18-20, 2026</text>'
                    '<line x1="150" y1="200" x2="650" y2="200" stroke="#38bdf8" stroke-width="1.5"/>'
                    '<text x="400" y="250" fill="#f0f9ff" font-family="sans-serif" font-size="16" text-anchor="middle">Decarbonization - AI Sovereignty - Next-Gen Infrastructure</text>'
                    '<rect x="300" y="290" width="200" height="50" rx="25" fill="#f59e0b"/>'
                    '<text x="400" y="322" fill="#78350f" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Surathkal, Karnataka</text>'
                    '</svg>'
                ).encode("utf-8")
            ),
        ]

        uploaded_urls = []
        for name, data in svg_templates:
            b64_str = "data:image/svg+xml;base64," + base64.b64encode(data).decode("utf-8")
            res = cloudinary.uploader.upload(
                b64_str,
                folder="alumni_conn/showcase",
                resource_type="image",
                public_id=f"showcase_{name}",
                overwrite=True,
            )
            url = res.get("secure_url")
            if url:
                uploaded_urls.append(url)

        if uploaded_urls:
            print(f"✅ Uploaded {len(uploaded_urls)} showcase graphics directly to Cloudinary.")
            return uploaded_urls + fallback_images
    except Exception as e:
        print(f"⚠️ Cloudinary upload warning: {e}. Falling back to default showcase image URLs.")

    return fallback_images


# =====================================================================
# SAFE RESET IMPLEMENTATION
# =====================================================================

def reset_demo_data(db: Session):
    """Safely removes ONLY showcase-seeded data.

    Preserves superadmin, other non-showcase colleges, and production records.
    """
    print("🧹 Initiating safe demo data reset...")

    # 1. Identify showcase colleges
    colleges = db.query(College).filter(College.slug.in_(SHOWCASE_COLLEGE_SLUGS)).all()
    college_ids = [c.id for c in colleges]
    print(f"  Found {len(colleges)} showcase colleges to clean up (IDs: {college_ids})")

    if college_ids:
        # 2. Find all users in these colleges
        users = db.query(User).filter(User.college_id.in_(college_ids)).all()
        user_ids = [u.id for u in users]
        print(f"  Found {len(users)} showcase users to clean up.")

        if user_ids:
            # Clean up notifications targeting or caused by showcase users
            db.query(Notification).filter(
                or_(Notification.recipient_id.in_(user_ids), Notification.actor_id.in_(user_ids))
            ).delete(synchronize_session=False)

            # Clean up messages in showcase colleges
            db.query(Message).filter(Message.college_id.in_(college_ids)).delete(synchronize_session=False)

            # Clean up conversations
            db.query(Conversation).filter(Conversation.college_id.in_(college_ids)).delete(synchronize_session=False)

            # Clean up comments on posts or by users
            db.query(Comment).filter(Comment.user_id.in_(user_ids)).delete(synchronize_session=False)

            # Clean up likes
            db.query(Like).filter(Like.user_id.in_(user_ids)).delete(synchronize_session=False)

            # Clean up posts
            db.query(Post).filter(Post.user_id.in_(user_ids)).delete(synchronize_session=False)

            # Clean up connections
            db.query(Connection).filter(Connection.college_id.in_(college_ids)).delete(synchronize_session=False)

            # Clean up profiles
            db.query(Profile).filter(Profile.user_id.in_(user_ids)).delete(synchronize_session=False)

            # Clean up users
            db.query(User).filter(User.id.in_(user_ids)).delete(synchronize_session=False)

        # Clean up college brandings
        db.query(CollegeBranding).filter(CollegeBranding.college_id.in_(college_ids)).delete(synchronize_session=False)

        # Clean up the colleges themselves
        db.query(College).filter(College.id.in_(college_ids)).delete(synchronize_session=False)

    # 3. Clean up Demo Super Admin specifically
    db.query(User).filter(User.username == "demo_superadmin").delete(synchronize_session=False)

    # 4. Clean up seeded showcase college requests
    db.query(CollegeRequest).filter(CollegeRequest.domain.in_(SHOWCASE_REQUEST_DOMAINS)).delete(synchronize_session=False)

    db.commit()
    print("✅ Safe reset complete. All showcase-seeded data removed without touching unrelated records.\n")


# =====================================================================
# SEEDING EXECUTION
# =====================================================================

def run_seed(db: Session, force_reset: bool = False):
    """Main idempotent execution pipeline."""
    now = datetime.utcnow()

    if force_reset:
        reset_demo_data(db)

    print("🚀 Starting AlumniConn Showcase Seeding...")

    # -------------------------------------------------------------
    # STEP 1: Super Admin & Demo Super Admin
    # -------------------------------------------------------------
    super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "admin2@gmail.com")
    super_admin_user = db.query(User).filter(User.email == super_admin_email).first()
    if not super_admin_user:
        super_admin_user = User(
            username=os.getenv("SUPER_ADMIN_USERNAME", "superadmin"),
            email=super_admin_email,
            password_hash=hash_password(os.getenv("SUPER_ADMIN_PASSWORD", "noman123")),
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=60),
            created_at=now - timedelta(days=60),
        )
        db.add(super_admin_user)
        db.flush()
        print(f"✅ Seeded Real Super Admin: {super_admin_email}")

    demo_superadmin = db.query(User).filter(User.username == "demo_superadmin").first()
    if not demo_superadmin:
        demo_superadmin = User(
            username="demo_superadmin",
            email="demo.superadmin@alumniconn.com",
            password_hash=DEMO_PASSWORD_HASH,
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=50),
            created_at=now - timedelta(days=50),
        )
        db.add(demo_superadmin)
        db.flush()
        print("✅ Seeded Dedicated Demo Super Admin: demo_superadmin")

    # -------------------------------------------------------------
    # STEP 2: Primary College (NITK)
    # -------------------------------------------------------------
    nitk = db.query(College).filter(College.slug == COLLEGE_DATA["slug"]).first()
    if not nitk:
        nitk = College(
            name=COLLEGE_DATA["name"],
            slug=COLLEGE_DATA["slug"],
            domain=COLLEGE_DATA["domain"],
            location=COLLEGE_DATA["location"],
            established_year=COLLEGE_DATA["established_year"],
            description=COLLEGE_DATA["description"],
            is_approved=True,
            is_active=True,
            created_at=now - timedelta(days=60),
        )
        db.add(nitk)
        db.flush()

        branding = CollegeBranding(
            college_id=nitk.id,
            primary_color="#0066cc",
            secondary_color="#4d94ff",
            accent_color="#ff9900",
            background_color="#f8f9fa",
            welcome_message=f"Welcome to {nitk.name} Alumni Network",
            motto="Building Bridges Across Generations",
        )
        db.add(branding)
        print(f"✅ Seeded Primary College: {nitk.name} ({nitk.slug})")

    # -------------------------------------------------------------
    # STEP 3: NITK College Admin
    # -------------------------------------------------------------
    admin_nitk = db.query(User).filter(User.username == "admin_nitk", User.college_id == nitk.id).first()
    if not admin_nitk:
        admin_nitk = User(
            username=COLLEGE_ADMIN_DATA["username"],
            email=COLLEGE_ADMIN_DATA["email"],
            password_hash=ADMIN_PASSWORD_HASH,
            college_id=nitk.id,
            role=UserRole.ADMIN,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=55),
            created_at=now - timedelta(days=55),
        )
        db.add(admin_nitk)
        db.flush()

        admin_profile = Profile(
            user_id=admin_nitk.id,
            college_id=nitk.id,
            full_name=COLLEGE_ADMIN_DATA["full_name"],
            job_title=COLLEGE_ADMIN_DATA["job_title"],
            job_industry=COLLEGE_ADMIN_DATA["job_industry"],
            location=COLLEGE_ADMIN_DATA["location"],
            bio=COLLEGE_ADMIN_DATA["bio"],
        )
        db.add(admin_profile)
        print("✅ Seeded NITK College Admin: admin_nitk")

    # -------------------------------------------------------------
    # STEP 4: Dedicated 1-Click Demo Personas in NITK
    # -------------------------------------------------------------
    # 4a. Demo Alumni (Ananya Sen)
    demo_alumni = db.query(User).filter(User.username == "demo_alumni", User.college_id == nitk.id).first()
    if not demo_alumni:
        demo_alumni = User(
            username="demo_alumni",
            email="demo.alumni@nitk.edu.in",
            password_hash=DEMO_PASSWORD_HASH,
            college_id=nitk.id,
            role=UserRole.ALUMNI,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=45),
            alumni_status=AlumniStatus.APPROVED,
            alumni_requested_at=now - timedelta(days=46),
            alumni_reviewed_at=now - timedelta(days=45),
            reviewed_by_id=admin_nitk.id,
            created_at=now - timedelta(days=46),
        )
        db.add(demo_alumni)
        db.flush()

        alumni_profile = Profile(
            user_id=demo_alumni.id,
            college_id=nitk.id,
            full_name="Ananya Sen (Demo Alumni)",
            bio="Senior AI Engineer at Microsoft India. Passionate about LLMs, cloud architecture, and mentoring students.",
            company="Microsoft India",
            job_title="Senior AI Engineer",
            job_industry="Artificial Intelligence & Cloud",
            location="Bengaluru, Karnataka",
            skills=["Python", "PyTorch", "Azure AI", "Machine Learning", "System Design", "Distributed Systems"],
            interests=["Generative AI", "Mentorship", "Robotics", "Cloud Computing"],
            grad_year=2020,
            major="Computer Science and Engineering",
        )
        sem_text = generate_semantic_text(alumni_profile)
        alumni_profile.semantic_hash = compute_semantic_hash(sem_text)
        alumni_profile.embedding = get_embedding(sem_text)
        db.add(alumni_profile)
        print("✅ Seeded Dedicated Demo Alumni: demo_alumni")

    # 4b. Demo Student (Rohan Mehta)
    demo_student = db.query(User).filter(User.username == "demo_student", User.college_id == nitk.id).first()
    if not demo_student:
        demo_student = User(
            username="demo_student",
            email="demo.student@nitk.edu.in",
            password_hash=DEMO_PASSWORD_HASH,
            college_id=nitk.id,
            role=UserRole.STUDENT,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=45),
            alumni_status=AlumniStatus.NOT_REQUESTED,
            created_at=now - timedelta(days=45),
        )
        db.add(demo_student)
        db.flush()

        student_profile = Profile(
            user_id=demo_student.id,
            college_id=nitk.id,
            full_name="Rohan Mehta (Demo Student)",
            bio="Final year B.Tech student at NITK. Lead author of ChronoCache. Passionate about Distributed Systems and Go.",
            job_title="Final Year Undergraduate",
            job_industry="Higher Education",
            location="Mangalore, Karnataka",
            skills=["Go", "Python", "Docker", "SQL", "Distributed Systems", "C++", "React"],
            interests=["Open Source", "Hackathons", "Cloud Computing", "High Throughput Systems"],
            grad_year=2026,
            major="Computer Science and Engineering",
        )
        sem_text = generate_semantic_text(student_profile)
        student_profile.semantic_hash = compute_semantic_hash(sem_text)
        student_profile.embedding = get_embedding(sem_text)
        db.add(student_profile)
        print("✅ Seeded Dedicated Demo Student: demo_student")

    # -------------------------------------------------------------
    # STEP 5: Additional NITK Students (Balanced Demographics)
    # -------------------------------------------------------------
    for s in ADDITIONAL_NITK_STUDENTS:
        existing_s = db.query(User).filter(User.username == s["username"], User.college_id == nitk.id).first()
        if not existing_s:
            status_enum = AlumniStatus(s["alumni_status"].lower())
            u = User(
                username=s["username"],
                email=s["email"],
                password_hash=DEMO_PASSWORD_HASH,
                college_id=nitk.id,
                role=UserRole.STUDENT,
                is_active=True,
                email_verified=True,
                email_verified_at=now - timedelta(days=40),
                alumni_status=status_enum,
                alumni_requested_at=now - timedelta(days=3) if status_enum == AlumniStatus.PENDING else None,
                created_at=now - timedelta(days=40),
            )
            db.add(u)
            db.flush()

            prof = Profile(
                user_id=u.id,
                college_id=nitk.id,
                full_name=s["full_name"],
                bio=s.get("bio", ""),
                major=s["major"],
                grad_year=s["grad_year"],
                skills=s["skills"],
                interests=s["interests"],
                location="Mangalore, Karnataka",
                job_industry="Higher Education",
            )
            sem_text = generate_semantic_text(prof)
            prof.semantic_hash = compute_semantic_hash(sem_text)
            prof.embedding = get_embedding(sem_text)
            db.add(prof)

    db.commit()
    print(f"✅ Seeded {len(ADDITIONAL_NITK_STUDENTS)} diverse NITK students with pgvector embeddings.")

    # -------------------------------------------------------------
    # STEP 6: 85 Realistic NITK Alumni with Precomputed Embeddings
    # -------------------------------------------------------------
    seeded_alumni_count = 0
    for idx, item in enumerate(SAMPLE_ALUMNI, 1):
        existing_alum = db.query(User).filter(
            (User.email == item["email"]) | (User.username == item["username"]),
            User.college_id == nitk.id,
        ).first()

        if existing_alum:
            continue

        created_days_ago = 45 - (idx % 25)
        new_alum = User(
            username=item["username"],
            email=item["email"],
            password_hash=DEMO_PASSWORD_HASH,
            college_id=nitk.id,
            role=UserRole.ALUMNI,
            is_active=True,
            email_verified=True,
            email_verified_at=now - timedelta(days=created_days_ago),
            alumni_status=AlumniStatus.APPROVED,
            alumni_requested_at=now - timedelta(days=created_days_ago + 1),
            alumni_reviewed_at=now - timedelta(days=created_days_ago),
            reviewed_by_id=admin_nitk.id,
            created_at=now - timedelta(days=created_days_ago + 1),
        )
        db.add(new_alum)
        db.flush()

        temp_prof = Profile(
            user_id=new_alum.id,
            college_id=nitk.id,
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
        sem_text = generate_semantic_text(temp_prof)
        temp_prof.semantic_hash = compute_semantic_hash(sem_text)
        temp_prof.embedding = get_embedding(sem_text)
        db.add(temp_prof)

        seeded_alumni_count += 1
        if seeded_alumni_count % 25 == 0:
            db.commit()
            print(f"  Processed {seeded_alumni_count} alumni profiles with embeddings...")

    db.commit()
    print(f"✅ Total realistic alumni active in NITK: {seeded_alumni_count + (85 - seeded_alumni_count)}")

    # -------------------------------------------------------------
    # STEP 7: Secondary Colleges (Apex, Crestview, Solaris)
    # -------------------------------------------------------------
    for sc in SECONDARY_COLLEGES:
        c_inst = db.query(College).filter(College.slug == sc["slug"]).first()
        if not c_inst:
            c_inst = College(
                name=sc["name"],
                slug=sc["slug"],
                domain=sc["domain"],
                location=sc["location"],
                established_year=sc["established_year"],
                description=sc["description"],
                is_approved=sc["is_approved"],
                is_active=sc["is_active"],
                created_at=now - timedelta(days=40),
            )
            db.add(c_inst)
            db.flush()

            b_data = sc["branding"]
            cb = CollegeBranding(
                college_id=c_inst.id,
                primary_color=b_data["primary_color"],
                secondary_color=b_data["secondary_color"],
                accent_color=b_data["accent_color"],
                background_color=b_data["background_color"],
                welcome_message=b_data["welcome_message"],
                motto=b_data["motto"],
            )
            db.add(cb)

            # Admin
            adm = sc["admin"]
            u_adm = User(
                username=adm["username"],
                email=adm["email"],
                password_hash=ADMIN_PASSWORD_HASH,
                college_id=c_inst.id,
                role=UserRole.ADMIN,
                is_active=True,
                email_verified=True,
                email_verified_at=now - timedelta(days=35),
                created_at=now - timedelta(days=35),
            )
            db.add(u_adm)
            db.flush()
            p_adm = Profile(
                user_id=u_adm.id,
                college_id=c_inst.id,
                full_name=adm["full_name"],
                job_title=adm["job_title"],
                job_industry=adm["job_industry"],
                location=adm["location"],
                bio=adm.get("bio", ""),
            )
            db.add(p_adm)

            # Users
            for u_data in sc["users"]:
                role_enum = UserRole(u_data["role"])
                u_obj = User(
                    username=u_data["username"],
                    email=u_data["email"],
                    password_hash=DEMO_PASSWORD_HASH,
                    college_id=c_inst.id,
                    role=role_enum,
                    is_active=True,
                    email_verified=True,
                    email_verified_at=now - timedelta(days=30),
                    alumni_status=AlumniStatus.APPROVED if role_enum == UserRole.ALUMNI else AlumniStatus.NOT_REQUESTED,
                    created_at=now - timedelta(days=30),
                )
                db.add(u_obj)
                db.flush()

                p_obj = Profile(
                    user_id=u_obj.id,
                    college_id=c_inst.id,
                    full_name=u_data["full_name"],
                    company=u_data.get("company"),
                    job_title=u_data.get("job_title"),
                    job_industry=u_data.get("job_industry"),
                    job_description=u_data.get("job_description"),
                    location=u_data.get("location"),
                    skills=u_data.get("skills", []),
                    interests=u_data.get("interests", []),
                    grad_year=u_data.get("grad_year"),
                    major=u_data.get("major"),
                    bio=u_data.get("bio", ""),
                )
                sem_text = generate_semantic_text(p_obj)
                p_obj.semantic_hash = compute_semantic_hash(sem_text)
                p_obj.embedding = get_embedding(sem_text)
                db.add(p_obj)

            # Posts
            for p_info in sc.get("posts", []):
                author = db.query(User).filter(User.username == p_info["author_username"]).first()
                if author:
                    p_created = now - timedelta(days=p_info["days_ago"])
                    new_post = Post(
                        user_id=author.id,
                        content=p_info["content"],
                        is_opportunity=p_info["is_opportunity"],
                        created_at=p_created,
                    )
                    db.add(new_post)
                    db.flush()

                    for c_info in p_info.get("comments", []):
                        c_author = db.query(User).filter(User.username == c_info["author_username"]).first()
                        if c_author:
                            db.add(Comment(
                                user_id=c_author.id,
                                post_id=new_post.id,
                                content=c_info["content"],
                                created_at=p_created + timedelta(hours=c_info["hours_after"]),
                            ))

            print(f"✅ Seeded Secondary College: {sc['name']} (slug: {sc['slug']}, active: {sc['is_active']})")

    db.commit()

    # -------------------------------------------------------------
    # STEP 8: College Requests (Pending & Rejected Audit Flow)
    # -------------------------------------------------------------
    for cr in COLLEGE_REQUESTS_DATA:
        existing_req = db.query(CollegeRequest).filter(CollegeRequest.domain == cr["domain"]).first()
        if not existing_req:
            st = CollegeRequestStatus(cr["status"].lower())
            req_obj = CollegeRequest(
                name=cr["name"],
                domain=cr["domain"],
                location=cr["location"],
                established_year=cr["established_year"],
                description=cr["description"],
                admin_name=cr["admin_name"],
                admin_email=cr["admin_email"],
                password_hash=ADMIN_PASSWORD_HASH,
                email_verified=cr["email_verified"],
                email_verified_at=now - timedelta(days=10) if cr["email_verified"] else None,
                status=st,
                rejection_reason=cr.get("rejection_reason"),
                reviewed_by=super_admin_user.id if st != CollegeRequestStatus.PENDING else None,
                reviewed_at=now - timedelta(days=2) if st != CollegeRequestStatus.PENDING else None,
                created_at=now - timedelta(days=12),
            )
            db.add(req_obj)
            print(f"✅ Seeded College Request: {cr['name']} [{st.value}]")

    db.commit()

    # -------------------------------------------------------------
    # STEP 9: Showcase Images & NITK Posts Seeding
    # -------------------------------------------------------------
    showcase_images = upload_synthetic_showcase_images()

    # Collect available NITK users for authoring posts
    nitk_users = db.query(User).filter(User.college_id == nitk.id).all()
    user_by_username = {u.username: u for u in nitk_users}

    created_posts: List[Post] = []
    for idx, p_info in enumerate(NITK_POSTS_DATA):
        author_username = p_info["author"]
        author = user_by_username.get(author_username)
        if not author:
            continue

        existing_p = db.query(Post).filter(
            Post.user_id == author.id,
            Post.content.like(p_info["content"][:40] + "%"),
        ).first()

        p_created = now - timedelta(days=p_info["days_ago"], hours=random.randint(1, 12))

        # Assign an image to select posts (15-20% ratio)
        image_url = None
        if idx in (0, 1, 2, 7, 14) and showcase_images:
            image_url = showcase_images[idx % len(showcase_images)]

        if not existing_p:
            new_p = Post(
                user_id=author.id,
                content=p_info["content"],
                image_url=image_url,
                is_opportunity=p_info["is_opportunity"],
                created_at=p_created,
            )
            db.add(new_p)
            db.flush()
            created_posts.append(new_p)
        else:
            created_posts.append(existing_p)

    # Add 40 additional realistic micro/medium/long posts from the 85 alumni to achieve 65+ total posts
    alumni_list = [u for u in nitk_users if u.role == UserRole.ALUMNI and u.username not in ("demo_alumni", "admin_nitk")]
    additional_post_templates = [
        # Short posts
        ("Quick question: Has anyone here migrated an Apache Kafka cluster to Redpanda in production? Looking for benchmarks on tail latencies.", False, 4),
        ("Kicking off our internal hackathon this weekend! Amazing to see three teams building on top of WebAssembly and DuckDB in the browser.", False, 8),
        ("Thrilled to celebrate 3 years at Razorpay today! Huge gratitude to my NITK seniors who gave me my very first code review.", False, 14),
        ("Surathkal friends: If you're attending AWS Summit in Bengaluru next week, let's grab coffee! Drop a comment below.", False, 16),
        ("Shoutout to Professor Bhattacharya for inspiring our batch to take operating systems seriously. That advice aged like fine wine.", False, 25),
        # Medium posts
        ("Observability tip: Don't alert on CPU utilization unless it's sustained above 90% for 10 minutes. Alert on p99 user latency and 5xx error budgets instead. Your on-call rotation sleep quality will improve by 300%.", False, 12),
        ("We just transitioned our search indexing pipeline from Elasticsearch to OpenSearch 2.14. Saved roughly 35% on infrastructure costs while gaining native vector k-NN search capabilities.", False, 19),
        ("For students interviewing for SDE roles this season: Practice writing code on a plain Google Doc or whiteboard without syntax highlighting. It trains you to think about edge cases before hitting compile.", False, 21),
        ("Hiring Frontend Engineers (React + TypeScript) at BrowserStack! 🌐 2-4 years experience building high-performance web applications with canvas/web workers. DM for referral.", True, 23),
        ("Sharing my experience giving my first international tech talk at PyCon APAC. The imposter syndrome was real, but explaining your architecture forces you to truly master the fundamentals.", False, 27),
        ("Hiring Backend Software Engineer (Golang) at PhonePe! 📱 Looking for engineers who enjoy low-level socket programming and high-throughput transactions. Ping me directly.", True, 29),
        ("The value of writing good documentation cannot be overstated. A clear README and architecture diagram saves 10x more time than writing 'clever' undocumented code.", False, 31),
        ("Reflecting on our early startup days: Moving fast is important, but taking 2 extra days to design a clean database schema saves 6 months of messy migrations later.", False, 34),
        ("Looking for 2 student research interns to work on open-source LLM quantization techniques (AWQ, GPTQ) for edge devices. Reach out if interested!", True, 36),
        ("To all final-year students: Placement season can be emotionally exhausting. Remember that your first job is just the starting line, not the finish line. Keep your spirits high!", False, 39),
        # Long posts
        ("""How we cut our PostgreSQL AWS RDS bill by $4,000/month with zero downtime:

1. Index bloat remediation: Identified 42 unused indexes using pg_stat_user_indexes and eliminated them, instantly reclaiming 180 GB of SSD storage and reducing write amplification.
2. Autovacuum tuning: Lowered autovacuum_vacuum_scale_factor from the default 0.2 down to 0.05 on high-churn transaction tables. Tables are now cleaned progressively instead of triggering massive I/O freezes during business hours.
3. TOAST column offloading: Migrated large JSON audit blobs into an S3 bucket with signed URLs instead of storing multi-megabyte payloads in relational rows.
4. Read replica rightsizing: Switched read replicas to AWS Graviton (ARM64) instances, improving throughput by 20% at 15% lower compute costs.

Always profile your database metrics before throwing larger EC2 instances at performance problems!""", False, 15),
        ("""Advice for juniors choosing between an early-stage funded startup and a Big Tech MNC offer:

Having spent 4 years at Amazon and now 3 years at a Series-B startup, here is the honest perspective I share during mentorship calls:

Choose Big Tech if:
• You want structured mentorship and world-class formal engineering processes.
• You want to observe how software operates at planetary scale (millions of RPS).
• You prioritize predictable compensation and work-life balance while building foundational depth.

Choose a High-Growth Startup if:
• You thrive in ambiguity and want to wear multiple hats (frontend, DevOps, product, client calls).
• You want to see the direct business impact of the code you ship within 48 hours.
• You want an accelerated path to technical leadership and systems ownership.

Both paths are incredible. The only mistake is picking a startup and expecting Big Tech stability, or picking Big Tech and expecting startup agility.""", False, 24),
        ("""Complete Roadmap for NITK Students aiming for Master's / PhD programs in Europe & US:

Over the past 3 years, I've helped 15+ juniors navigate their graduate applications. Here is the recommended timeline starting from 5th semester:

1. 5th & 6th Semester (Research & Publications):
• Work with college faculty on capstone or undergraduate research. Aim for at least one IEEE/ACM student conference workshop paper.
• Maintain a strong GPA (>8.5/10). Academic committees screen heavily on foundational coursework grades.

2. 6th Semester Summer:
• Research internships at premier institutes (IISc, IITs, or DAAD/Mitacs programs).
• Start preparing for GRE (if required by target universities) and TOEFL/IELTS.

3. 7th Semester (Fall Application Cycle):
• Draft your Statement of Purpose (SOP). Focus 80% on technical research questions and fit with specific lab professors, not childhood nostalgia.
• Request Letters of Recommendation (LORs) early from professors who know your technical work directly.

        Feel free to ping me if you need someone to review your SOP drafts!""", False, 33),
        # Additional 25+ rich posts to reach ~70+ posts
        ("Delighted to share that our paper on 'Low-Power Spiking Neural Network Accelerators' has been accepted at IEEE ISCAS 2026! Huge thanks to our NITK professors.", False, 3),
        ("Pro tip for Python engineers: Always profile with py-spy in production before trying to optimize algorithms blindly. Nine times out of ten, it is an accidental N+1 query.", False, 7),
        ("Surathkal nostalgia: Remembering the midnight chai sessions at Red Rock after late-night lab exams. Best four years ever! Cherish it while you can.", False, 17),
        ("Great catching up with the NITK Pune alumni chapter over the weekend! Over 60 alumni attended across 12 batches from 2010 to 2024.", False, 22),
        ("Shoutout to the library staff at NITK who let us keep our laptops charged in the reading room during end-sems. Pure dedication to students.", False, 28),
        ("Hiring: Looking for 2 backend interns (Go/Python) to work on our open-source developer tooling at an early-stage startup. DM me with your GitHub!", True, 30),
        ("The single biggest productivity boost for our backend team this year was adopting contract-first API design with OpenAPI and Buf (Protobuf). Generating client SDKs and mock servers automatically eliminated 90% of cross-team coordination meetings.", False, 5),
        ("Why database schema migrations fail in production: Adding a column with a default value in older Postgres versions locks the entire table. In modern Postgres, use nullable columns and backfill asynchronously with batched updates to avoid blocking queries.", False, 10),
        ("To student developers: Learn how git works under the hood (blobs, trees, commits, refs). Knowing how `git reflog` and interactive rebase work will rescue you from 99% of repository mishaps.", False, 13),
        ("Hiring Senior DevOps Engineer at Zepto! Looking for someone who loves Terraform, Kubernetes, and reducing AWS bills without sacrificing 99.99% uptime. DM for direct referral.", True, 18),
        ("Reflections on 5 years as an engineer in Bengaluru: Soft skills like written communication, active listening, and estimating realistic deadlines matter just as much as writing clean code.", False, 20),
        ("We just replaced Redis with Dragonfly in our staging environment for ephemeral session storage. Memory footprint dropped by 25% with zero code changes thanks to full Redis protocol compatibility.", False, 26),
        ("Hiring Machine Learning Platform Engineer at Swiggy! 🛵 Focus on real-time feature stores and Feast deployment on Kubernetes. Ping me with your resume.", True, 28),
        ("For students preparing for coding interviews: Don't memorize solutions. Categorize problems into patterns: Two Pointers, Sliding Window, Monotonic Stack, Topological Sort, and Union-Find.", False, 32),
        ("How we reduced our React bundle size by 65%: Code-splitting route components with React.lazy, switching from Moment.js to date-fns, and pruning unused Lucide icons from our vendor chunk.", False, 35),
        ("Hiring: Core Platform Engineer at Zerodha! 📈 We build high-concurrency financial trading systems using Go and Vue. Seeking engineers who care deeply about low latency.", True, 37),
        ("Advice on choosing an undergraduate capstone project: Solve a problem you or your campus actually experiences. A working prototype tested by 50 students is worth 10 theoretical papers.", False, 40),
        ("The importance of circuit breakers in distributed microservices: When an external SMS gateway or payment provider is slow, failing fast protects your internal worker threads from starvation.", False, 42),
        ("Hiring: Full Stack Engineer (Next.js + Node.js) at CRED! 💳 Looking for candidates with eye for detail in UI micro-animations and solid database modeling. Reach out for referral.", True, 43),
        ("""Building a Zero-Downtime Database Migration Pipeline: Lessons from 100k RPS Production Systems:

When migrating tables with hundreds of millions of rows, naive ALTER TABLE statements will lock writes and bring down your service. Here is our 5-phase migration recipe:

1. Expand Phase: Add the new column or table as nullable. Do not add foreign key constraints yet.
2. Dual-Write Phase: Update your application backend to write to both the old and new columns. All reads still query the old column.
3. Backfill Phase: Run a background worker that migrates historic rows in small batches (e.g. 5,000 rows per transaction with a 100ms pause) to keep database replication lag near zero.
4. Read Switch Phase: Point application reads to the new column once the backfill finishes and data consistency is validated.
5. Contract Phase: Remove dual writes and safely drop the old column during a scheduled maintenance window.

Zero downtime, zero locks, and 100% reversible at any stage!""", False, 6),
        ("""Mastering System Design for Campus & SDE-1 Interviews: The Step-by-Step Blueprint:

Most students freeze when asked to 'Design YouTube' or 'Design URL Shortener'. Here is the exact structured framework interviewers look for in a 45-minute loop:

1. Requirements & Scope Clarification (5 mins):
• Functional: What are the core user flows? (e.g. paste URL, get 7-char short link, redirect on click)
• Non-functional: Availability vs Consistency? Read-to-write ratio? Latency targets?

2. Capacity Estimation (5 mins):
• Daily active writes vs reads (e.g. 10M writes/day = ~115 writes/sec, 100:1 read ratio = ~11,500 reads/sec)
• Storage calculation over 5 years so you can pick appropriate database engines.

3. High-Level Architecture (10 mins):
• API Gateway -> Load Balancer -> Stateless Web Tier -> Cache -> Persistent Storage.

4. Deep Dive & Bottlenecks (20 mins):
• Hash collision avoidance (Base62 vs MD5/SHA-256 with counter)
• Caching strategy (Redis with LRU eviction for top 20% trending URLs)
• Database partitioning (sharding by hash of short key to distribute write I/O).

5. Summary & Tradeoffs (5 mins):
• Acknowledge failure modes and single points of failure.

Clear communication and structured thinking will always win over guessing random buzzwords!""", False, 16),
        ("""The Evolution of AI Infrastructure: From Model Training to Efficient Edge Inference:

Over the past year, the industry pendulum has swung from 'Who can train the biggest 400B model' to 'How can we serve specialized models at 1/10th the cost and under 50ms latency.'

Key architectural breakthroughs driving this shift:
1. Speculative Decoding: Using a tiny 1B draft model to generate candidate tokens in parallel, which are then verified by an 8B target model in a single forward pass, yielding 2-3x speedups.
2. FlashAttention-3: Harnessing asynchronous memory copies on modern tensor cores to eliminate memory bandwidth bottlenecks during long context processing.
3. Multi-Query and Grouped-Query Attention (GQA): Reducing the memory footprint of KV caches by 8x, allowing servers to handle 8x larger concurrent batch sizes without OOM crashes.

For undergraduates entering the field: Computer systems and GPU kernel programming (Triton, CUDA) are currently the highest leverage skills in AI engineering.""", False, 24),
        ("""How We Built a High-Throughput Event Processing Engine with Apache Kafka and ClickHouse:

At our logistics startup, tracking delivery riders and order lifecycle state requires processing over 50,000 telemetry pings per second. Here is how we designed the pipeline:

1. Ingestion: Mobile clients emit compressed Protobuf payloads over HTTP/2 to an Envoy reverse proxy that writes directly into partitioned Kafka topics.
2. Stream Transformation: Go microservices validate rider coordinates, enrich pings with order IDs, and emit cleaned records into downstream topics.
3. Analytical Sink: A ClickHouse Kafka engine table continuously reads from Kafka and materializes rows into an AggregatingMergeTree table partitioned by day.
4. Real-time Dashboard: Analytical queries calculating average delivery times, rider idle hours, and regional heatmaps execute in under 40ms directly against ClickHouse.

The entire pipeline operates on just 4 medium cloud instances and handles peak festival bursts effortlessly.""", False, 38),
        ("""Complete Guide to Navigating Technical Placement Rejections: A Senior Alumnus Perspective:

With placement season in full swing at Surathkal, I want to share something I wish someone had told me back when I was a student:

During my 7th semester, I was rejected by the first 4 companies that visited campus. It felt crushing at the time—watching friends get placed while wondering if I wasn't good enough.

Here is what I learned after being on both sides of the interview table:
1. Rejections are often about headcount and timing, not your worth or potential as an engineer.
2. Treat every rejection as free diagnostic data. Write down every question you struggled with immediately after the interview and master that topic the next day.
3. Your career is a 35-year marathon. The company you join on Day 1 does not define where you will be 3 or 5 years from now.
4. Support your peers genuinely. When your friends succeed, celebrate them—your college network will be your biggest career advantage for the next three decades.

Stay persistent, keep building, and trust the process! Surathkal engineers always find their way to great things. 🌟""", False, 44),
        # Final set of rich technical & career posts
        ("Delighted to welcome 15 incoming NITK summer interns to Microsoft India today! High energy and solid technical foundations.", False, 2),
        ("Quick poll: What is your preferred distributed tracing backend in 2026? OpenTelemetry + Jaeger vs Grafana Tempo? Drop your experiences below.", False, 9),
        ("Congratulations to the NITK ACM Student Chapter for securing 2nd place at the national ICPC regional rounds! Inspiring achievement.", False, 18),
        ("Surathkal beach sunsets never get old. Sharing a warm hello to all alumni from the Western Ghats campus!", False, 26),
        ("How we achieved 99.999% uptime for our core banking ledger: Multi-AZ read replicas with synchronous commit, aggressive connection health checks, and automated failover orchestration via AWS RDS Proxy.", False, 11),
        ("Hiring: Data Platform Engineers at Swiggy! 🍕 Working on Apache Iceberg, Trino, and real-time Kafka streaming pipelines. DM me with your resume for fast-track review.", True, 17),
        ("For students preparing for frontend technical screens: Practice building custom React hooks from scratch (useDebounce, useThrottle, useIntersectionObserver). Interviewers test deep lifecycle understanding.", False, 21),
        ("Why early-stage startups should postpone microservices: A modular monolith with clear domain boundaries is 10x easier to refactor, debug, and deploy until your engineering organization crosses 40 engineers.", False, 27),
        ("Hiring: Senior Security Analyst at Razorpay! 🛡️ Looking for expertise in application security, automated SAST/DAST pipelines, and AWS IAM least-privilege policies. Reach out for referral.", True, 31),
        ("Reflections on mentoring student capstones: The most impressive student projects aren't necessarily the ones with 50 buzzwords in the README, but the ones with clear performance benchmarks and comprehensive unit test coverage.", False, 36),
        ("Hiring: Distributed Systems Engineer at Atlassian! 🚀 Building real-time document collaboration and CRDT synchronization engines. Seeking strong fundamentals in Go or Java.", True, 41),
        ("""Optimizing Python AsyncIO for High-Concurrency Microservices: Lessons from Production:

Many teams migrate from synchronous Flask/Django to FastAPI/AsyncIO expecting instant 10x throughput gains, only to see thread starvation under load. Here are the 4 golden rules of AsyncIO:

1. Never run CPU-intensive operations on the event loop: Parsing 50MB JSON payloads or computing cryptographic hashes on the main thread will block the entire event loop. Offload CPU-bound tasks to asyncio.to_thread or a ProcessPoolExecutor.
2. Connection pool sizing: Ensure your async database connection pool matches your worker concurrency. A pool that is too small leads to connection queue timeouts; a pool that is too large exhausts Postgres connection memory.
3. Cancellation handling: When a client terminates an HTTP request early, ensure your async tasks handle asyncio.CancelledError gracefully and rollback uncommitted database transactions.
4. Structured Concurrency: Use asyncio.TaskGroup (Python 3.11+) instead of uncontrolled asyncio.gather to prevent dangling orphaned tasks during partial failures.

Write clean async code and your services will easily handle 20k concurrent requests per instance!""", False, 14),
        ("""Complete Preparation Guide for the Google / Microsoft SDE-2 Low-Level Design (LLD) Round:

While high-level system design focuses on distributed architecture, the LLD (Object-Oriented Design) round tests your code craftsmanship and SOLID principles in 60 minutes.

Classic problems frequently asked:
• Design a Parking Lot System
• Design an In-Memory Cache with pluggable eviction policies
• Design a Rate Limiter (Token Bucket / Sliding Window)
• Design an Elevator Control Dispatcher
• Design a Movie Ticket Booking System (BookMyShow)

Key evaluation criteria:
1. Clear Class Diagram: Entities, Interfaces, Enums, and Relationships (Composition > Inheritance).
2. Design Patterns applied judiciously: Strategy pattern for algorithms, Factory pattern for object creation, Observer pattern for event notifications.
3. Thread Safety: Using Mutex locks or ReadWrite locks appropriately to handle concurrent booking or cache access without race conditions.
4. Extensibility: Demonstrating that adding a new payment gateway or cache eviction policy requires zero modifications to existing classes (Open-Closed Principle).

Practice writing runnable, compiling code in your language of choice!""", False, 23),
        ("""The Road to Technical Leadership: What Changes When You Become a Staff / Principal Engineer:

The transition from Senior Engineer (SDE-3) to Staff Engineer is rarely about writing more code. It is a fundamental shift in scope and influence:

• From solving hard problems to identifying which problems are worth solving.
• From optimizing single services to driving architectural cohesion across 6 different platform teams.
• From answering technical questions to asking the right architectural questions that prevent catastrophic design choices 12 months in advance.
• Sponsoring and amplifying junior and mid-level engineers so the entire engineering organization grows around you.

To all ambitious engineers at NITK: Build deep technical depth first, but cultivate empathy, clarity in written documentation, and cross-functional alignment. That is what creates lasting organizational impact.""", False, 37),
        ("""How We Reduced Cloud Infrastructure Costs by 40% Across Our Microservices Fleet:

At our scale-up company, cloud infrastructure costs were growing 2x faster than revenue. Over a 4-month initiative, we engineered these optimizations:

1. Spot Instance Fleet Adoption: Migrated 80% of our stateless web and background worker pods to AWS EC2 Spot instances using Karpenter for predictive node termination handling. Savings: 65% on worker compute.
2. Network Egress Elimination: Configured AWS VPC Endpoints for S3, DynamoDB, and CloudWatch. Eliminating NAT Gateway data processing charges saved over $6,500 every single month.
3. Log Ingestion Pruning: Filtered out health check logs and debug logs in production, reducing daily Datadog/CloudWatch ingestion volume by 72%.
4. Right-Sizing Redis Cache Clusters: Implemented active key TTL policies and switched to memory-optimized Graviton instance families.

Cost efficiency is an engineering discipline. Treat resource efficiency as a first-class architectural requirement!""", False, 45),
    ]

    for idx, (content, is_opp, days_ago) in enumerate(additional_post_templates):
        author = alumni_list[idx % len(alumni_list)]
        p_created = now - timedelta(days=days_ago, hours=random.randint(2, 10))

        existing_p = db.query(Post).filter(
            Post.user_id == author.id,
            Post.content.like(content[:35] + "%"),
        ).first()

        if not existing_p:
            new_p = Post(
                user_id=author.id,
                content=content,
                is_opportunity=is_opp,
                created_at=p_created,
            )
            db.add(new_p)
            db.flush()
            created_posts.append(new_p)
        else:
            if existing_p not in created_posts:
                created_posts.append(existing_p)

    db.commit()
    print(f"✅ Active Posts in NITK: {len(created_posts)}")

    # -------------------------------------------------------------
    # STEP 10: Comments Seeding (Deep discussions & thread depth)
    # -------------------------------------------------------------
    total_comments_seeded = 0

    # 10a. Seed mapped curated comments
    for p_idx, c_list in NITK_COMMENTS_MAP.items():
        if p_idx < len(created_posts):
            target_post = created_posts[p_idx]
            for c_info in c_list:
                author = user_by_username.get(c_info["author"])
                if not author:
                    continue

                existing_c = db.query(Comment).filter(
                    Comment.post_id == target_post.id,
                    Comment.user_id == author.id,
                    Comment.content.like(c_info["content"][:30] + "%"),
                ).first()

                if not existing_c:
                    c_created = target_post.created_at + timedelta(hours=c_info["hours_after"])
                    db.add(Comment(
                        user_id=author.id,
                        post_id=target_post.id,
                        content=c_info["content"],
                        created_at=c_created,
                    ))
                    total_comments_seeded += 1

    # 10b. Seed natural comment distribution across all posts
    comment_pool = [
        "Insightful breakdown! Thanks for sharing this with the community.",
        "Could not agree more. We faced the exact same issue during our last release.",
        "Great initiative! Reaching out via DM with my details.",
        "This should be required reading for all final year students.",
        "Appreciate the transparent breakdown of the tradeoffs here.",
        "Bookmarking this thread for our team's architectural review next week.",
        "Proud to see such high caliber engineering discussions happening on AlumniConn!",
        "Thanks for the referral opportunity! Just sent across my resume.",
        "What was the impact on latency when you made this change?",
        "Solid advice. Will definitely incorporate this into our capstone project.",
        "Congratulations on this milestone! Well deserved.",
        "Surathkal beach sunsets are truly unforgettable. Nostalgic read!",
        "How does this approach compare with standard industry patterns?",
        "Very timely guidance, especially with campus recruitment approaching.",
        "Thanks for writing this in such detail. Really helps demystify the topic.",
        "Sent you a connection request, would love to ask a quick follow up question.",
        "The emphasis on fundamentals here is so true. Frameworks come and go.",
        "Shared this with my project group mates, great learning material!",
    ]

    for p in created_posts:
        current_count = db.query(Comment).filter(Comment.post_id == p.id).count()
        # Ensure every post has at least 2 to 4 comments, with popular posts having more
        needed = max(0, 3 - current_count)
        if random.random() < 0.25:
            needed += random.randint(1, 3)

        for _ in range(needed):
            commenter = random.choice(nitk_users)
            if commenter.id != p.user_id:
                c_text = random.choice(comment_pool)
                c_time = p.created_at + timedelta(hours=random.randint(1, 48), minutes=random.randint(5, 50))
                if c_time < now:
                    db.add(Comment(
                        user_id=commenter.id,
                        post_id=p.id,
                        content=c_text,
                        created_at=c_time,
                    ))
                    total_comments_seeded += 1

    db.commit()
    print(f"✅ Total comments active across NITK posts: {db.query(Comment).join(Post).join(User, Post.user_id == User.id).filter(User.college_id == nitk.id).count()}")

    # -------------------------------------------------------------
    # STEP 11: Believable Likes Distribution (Zero Duplicates)
    # -------------------------------------------------------------
    likes_added = 0
    for p in created_posts:
        existing_likes_count = db.query(Like).filter(Like.post_id == p.id).count()
        if existing_likes_count < 2:
            target_likes = random.choices([random.randint(2, 4), random.randint(5, 10), random.randint(12, 22)], weights=[0.4, 0.45, 0.15])[0]
            likers = random.sample(nitk_users, min(target_likes, len(nitk_users)))
            for lkr in likers:
                existing_like = db.query(Like).filter(Like.user_id == lkr.id, Like.post_id == p.id).first()
                if not existing_like:
                    l_time = p.created_at + timedelta(minutes=random.randint(15, 1800))
                    if l_time < now:
                        db.add(Like(
                            user_id=lkr.id,
                            post_id=p.id,
                            created_at=l_time,
                        ))
                        likes_added += 1

    db.commit()
    print(f"✅ Likes seeded across NITK posts: {db.query(Like).join(Post).join(User, Post.user_id == User.id).filter(User.college_id == nitk.id).count()}")

    # -------------------------------------------------------------
    # STEP 12: Realistic Connections Social Graph
    # -------------------------------------------------------------
    existing_connection_pairs = set()
    for row in db.query(Connection.college_id, Connection.sender_id, Connection.receiver_id).all():
        existing_connection_pairs.add((row[0], min(row[1], row[2]), max(row[1], row[2])))

    def ensure_conn(u1_id: int, u2_id: int, col_id: int, status: ConnectionStatus, created_time: datetime):
        if u1_id == u2_id:
            return
        pair_key = (col_id, min(u1_id, u2_id), max(u1_id, u2_id))
        if pair_key in existing_connection_pairs:
            return
        existing_connection_pairs.add(pair_key)
        db.add(Connection(
            college_id=col_id,
            sender_id=u1_id,
            receiver_id=u2_id,
            status=status,
            created_at=created_time,
        ))

    # 12a. Demo Student Connections
    rahul_u = user_by_username.get("rahul_sharma_backend")
    vikram_u = user_by_username.get("vikram_rao_cloud")
    karan_u = user_by_username.get("karan_patel")
    aditi_u = user_by_username.get("aditi_verma")
    priya_u = user_by_username.get("priya_nair")
    sneha_u = user_by_username.get("preeti_sundar_devops")

    # Accepted
    ensure_conn(demo_student.id, demo_alumni.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=25))
    ensure_conn(demo_student.id, admin_nitk.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=20))
    if rahul_u:
        ensure_conn(demo_student.id, rahul_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=15))
    if vikram_u:
        ensure_conn(demo_student.id, vikram_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=12))
    if karan_u:
        ensure_conn(demo_student.id, karan_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=30))
    if sneha_u:
        ensure_conn(demo_student.id, sneha_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=10))

    # Pending incoming to demo_student (requests that demo_student can accept in the UI!)
    if aditi_u:
        ensure_conn(aditi_u.id, demo_student.id, nitk.id, ConnectionStatus.PENDING, now - timedelta(days=1, hours=4))
    if priya_u:
        ensure_conn(priya_u.id, demo_student.id, nitk.id, ConnectionStatus.PENDING, now - timedelta(hours=8))

    # 12b. Demo Alumni Connections
    ensure_conn(demo_alumni.id, admin_nitk.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=35))
    if rahul_u:
        ensure_conn(demo_alumni.id, rahul_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=30))
    if vikram_u:
        ensure_conn(demo_alumni.id, vikram_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=28))
    if sneha_u:
        ensure_conn(demo_alumni.id, sneha_u.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=25))

    # Connect demo_alumni with 20 other alumni
    for a in alumni_list[:20]:
        ensure_conn(demo_alumni.id, a.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=random.randint(10, 40)))

    # Pending incoming request for demo_alumni to accept
    if aditi_u:
        ensure_conn(aditi_u.id, demo_alumni.id, nitk.id, ConnectionStatus.PENDING, now - timedelta(days=1, hours=2))

    # 12c. Realistic mesh across the remaining alumni and students (~120 connections)
    for i in range(len(alumni_list)):
        target_connections = random.randint(1, 3)
        for _ in range(target_connections):
            partner = random.choice(alumni_list)
            if partner.id != alumni_list[i].id:
                ensure_conn(alumni_list[i].id, partner.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=random.randint(5, 35)))

    # Connect students to selected alumni
    for s_user in [u for u in nitk_users if u.role == UserRole.STUDENT and u.username != "demo_student"]:
        alumni_partner = random.choice(alumni_list)
        ensure_conn(s_user.id, alumni_partner.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=random.randint(3, 20)))

    db.commit()
    print(f"✅ Total connections active in NITK: {db.query(Connection).filter(Connection.college_id == nitk.id).count()}")

    # -------------------------------------------------------------
    # STEP 13: Threaded Conversations & Messages
    # -------------------------------------------------------------
    for c_info in NITK_CONVERSATIONS_DATA:
        u1 = user_by_username.get(c_info["user1"])
        u2 = user_by_username.get(c_info["user2"])
        if not (u1 and u2):
            continue

        # Ensure they are connected
        ensure_conn(u1.id, u2.id, nitk.id, ConnectionStatus.ACCEPTED, now - timedelta(days=c_info["days_ago"] + 2))

        # Check existing conversation
        convo = db.query(Conversation).filter(
            Conversation.college_id == nitk.id,
            or_(
                (Conversation.user1_id == u1.id) & (Conversation.user2_id == u2.id),
                (Conversation.user1_id == u2.id) & (Conversation.user2_id == u1.id),
            )
        ).first()

        c_base_time = now - timedelta(days=c_info["days_ago"])
        if not convo:
            convo = Conversation(
                user1_id=u1.id,
                user2_id=u2.id,
                college_id=nitk.id,
                created_at=c_base_time,
            )
            db.add(convo)
            db.flush()

        # Add messages if not present
        existing_msgs = db.query(Message).filter(Message.conversation_id == convo.id).count()
        if existing_msgs == 0:
            for m_item in c_info["messages"]:
                sender = user_by_username.get(m_item["sender"])
                if sender:
                    m_time = c_base_time + timedelta(minutes=m_item["offset_minutes"])
                    db.add(Message(
                        conversation_id=convo.id,
                        college_id=nitk.id,
                        sender_id=sender.id,
                        content=m_item["content"],
                        timestamp=m_time,
                    ))

    db.commit()
    print(f"✅ Threaded Conversations active in NITK: {db.query(Conversation).filter(Conversation.college_id == nitk.id).count()} with {db.query(Message).filter(Message.college_id == nitk.id).count()} messages")

    # -------------------------------------------------------------
    # STEP 14: Notifications Seeding (Matching Persona Activity)
    # -------------------------------------------------------------
    # Demo Student Notifications
    notifs_to_seed = [
        (
            demo_student.id,
            aditi_u.id if aditi_u else None,
            NotificationType.CONNECTION_RECEIVED,
            "New Connection Request",
            "Aditi Verma sent you a connection request.",
            {"connection_id": 1},
            False,
            now - timedelta(days=1, hours=4),
        ),
        (
            demo_student.id,
            priya_u.id if priya_u else None,
            NotificationType.CONNECTION_RECEIVED,
            "New Connection Request",
            "Priya Nair sent you a connection request.",
            {"connection_id": 2},
            False,
            now - timedelta(hours=8),
        ),
        (
            demo_student.id,
            demo_alumni.id,
            NotificationType.CONNECTION_ACCEPTED,
            "Connection Request Accepted",
            "Ananya Sen (Demo Alumni) accepted your connection request.",
            {"connection_id": 3},
            True,
            now - timedelta(days=3),
        ),
        (
            demo_student.id,
            rahul_u.id if rahul_u else None,
            NotificationType.POST_COMMENTED,
            "New Comment",
            "Rahul Sharma commented on your ChronoCache project post.",
            {"post_id": created_posts[1].id if len(created_posts) > 1 else 1},
            True,
            now - timedelta(days=5, hours=1),
        ),
        (
            demo_student.id,
            vikram_u.id if vikram_u else None,
            NotificationType.POST_LIKED,
            "New Like",
            "Vikramaditya Rao liked your post.",
            {"post_id": created_posts[1].id if len(created_posts) > 1 else 1},
            True,
            now - timedelta(days=5, hours=2),
        ),
        (
            demo_student.id,
            None,
            NotificationType.RECOMMENDATIONS_AVAILABLE,
            "New Alumni Recommendations",
            "New alumni recommendations are available based on your interest in Distributed Systems.",
            {},
            False,
            now - timedelta(hours=2),
        ),
    ]

    # Demo Alumni Notifications
    notifs_to_seed.extend([
        (
            demo_alumni.id,
            aditi_u.id if aditi_u else None,
            NotificationType.CONNECTION_RECEIVED,
            "New Connection Request",
            "Aditi Verma sent you a connection request.",
            {},
            False,
            now - timedelta(days=1, hours=2),
        ),
        (
            demo_alumni.id,
            demo_student.id,
            NotificationType.POST_COMMENTED,
            "New Comment",
            "Rohan Mehta commented on your Microsoft hiring post.",
            {"post_id": created_posts[0].id if created_posts else 1},
            True,
            now - timedelta(days=3, hours=2),
        ),
        (
            demo_alumni.id,
            admin_nitk.id,
            NotificationType.MESSAGE_RECEIVED,
            "New Message",
            "Prof. R. K. Bhattacharya sent you a message.",
            {},
            False,
            now - timedelta(days=6, hours=1),
        ),
    ])

    for r_id, a_id, n_type, title, msg, meta, is_r, c_time in notifs_to_seed:
        if not r_id:
            continue
        existing_n = db.query(Notification).filter(
            Notification.recipient_id == r_id,
            Notification.title == title,
            Notification.notification_type == n_type,
        ).first()

        if not existing_n:
            db.add(Notification(
                recipient_id=r_id,
                actor_id=a_id,
                notification_type=n_type,
                title=title,
                message=msg,
                metadata_=meta,
                is_read=is_r,
                created_at=c_time,
                read_at=c_time + timedelta(hours=1) if is_r else None,
            ))

    db.commit()
    print("✅ Seeded contextual notifications for demo personas.")

    # -------------------------------------------------------------
    # FINAL METRICS & SUMMARY
    # -------------------------------------------------------------
    total_colleges = db.query(College).count()
    total_users = db.query(User).count()
    total_profiles = db.query(Profile).count()
    total_posts = db.query(Post).count()
    total_comments = db.query(Comment).count()
    total_likes = db.query(Like).count()
    total_conns = db.query(Connection).count()
    total_convos = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    total_notifs = db.query(Notification).count()
    total_requests = db.query(CollegeRequest).count()

    print("\n" + "=" * 60)
    print("🎉 ALUMNICONN SHOWCASE SEEDING COMPLETE")
    print("=" * 60)
    print(f"• Colleges: {total_colleges}")
    print(f"• College Requests: {total_requests}")
    print(f"• Users: {total_users} (Profiles: {total_profiles})")
    print(f"• Posts: {total_posts} (NITK: {len(created_posts)})")
    print(f"• Comments: {total_comments}")
    print(f"• Likes: {total_likes}")
    print(f"• Connections: {total_conns}")
    print(f"• Conversations: {total_convos}")
    print(f"• Messages: {total_messages}")
    print(f"• Notifications: {total_notifs}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="AlumniConn Showcase & Demo Seeder")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Safely remove existing showcase demo data before seeding",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        run_seed(db, force_reset=args.reset)
    finally:
        db.close()


if __name__ == "__main__":
    main()
