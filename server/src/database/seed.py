from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, ProgrammingError
from datetime import datetime
import os
import sys

from src.models.user import User, UserRole, AlumniStatus
from src.models.profile import Profile
from src.models.college import College
from src.models.college_branding import CollegeBranding
from src.models.college_request import CollegeRequest, CollegeRequestStatus
from src.models.connection import Connection, ConnectionStatus
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


def seed_demo_super_admin(db: Session) -> User | None:
    """Seed dedicated demo super admin account."""
    email = "demo.superadmin@alumniconn.com"
    username = "demo_superadmin"
    password = "DevAlumni@2026!"

    try:
        admin = db.query(User).filter(User.username == username).first()
    except (OperationalError, ProgrammingError) as exc:
        db.rollback()
        print(f"Skipping demo super admin seed: {exc}")
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
            created_at=datetime.utcnow(),
        )
        db.add(new_admin)
        try:
            db.commit()
            db.refresh(new_admin)
            print(f"✅ Created Demo Super Admin: {username} ({email})")
            return new_admin
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to seed Demo Super Admin: {e}")
            return None
    else:
        print(f"ℹ️ Demo Super Admin {username} already exists. Skipping.")
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


def seed_additional_colleges(db: Session) -> list[College]:
    """Seed additional realistic colleges (active and deactivated)."""
    additional_colleges_data = [
        {
            "name": "Birla Institute of Technology and Science, Pilani",
            "slug": "bits-pilani",
            "domain": "bits-pilani.ac.in",
            "location": "Pilani, Rajasthan",
            "established_year": 1964,
            "description": "Institute of Eminence offering world-class technology, science, and humanities education.",
            "is_approved": True,
            "is_active": True,
            "admin": {
                "username": "admin_bits",
                "email": "alumni.director@bits-pilani.ac.in",
                "full_name": "Prof. S. R. Ramakrishnan",
                "job_title": "Dean of Alumni Relations & Resource Mobilization",
            }
        },
        {
            "name": "Indian Institute of Technology, Bombay",
            "slug": "iit-bombay",
            "domain": "iitb.ac.in",
            "location": "Powai, Mumbai, Maharashtra",
            "established_year": 1958,
            "description": "Globally recognized institute for pioneering engineering research, innovation, and leadership.",
            "is_approved": True,
            "is_active": True,
            "admin": {
                "username": "admin_iitb",
                "email": "dean.acr@iitb.ac.in",
                "full_name": "Prof. Rajesh Gokhale",
                "job_title": "Dean of Alumni and Corporate Relations",
            }
        },
        {
            "name": "Delhi Technological University",
            "slug": "dtu",
            "domain": "dtu.ac.in",
            "location": "Shahbad Daulatpur, Bawana Road, Delhi",
            "established_year": 1941,
            "description": "Historic technical university focused on engineering education and applied research.",
            "is_approved": True,
            "is_active": False,  # Deactivated college for testing status toggle & filters
            "admin": {
                "username": "admin_dtu",
                "email": "alumni.affairs@dtu.ac.in",
                "full_name": "Dr. Pradeep Kumar",
                "job_title": "Director of Alumni Affairs",
            }
        },
    ]

    colleges = []
    default_password = hash_password("Admin@Alumni2026!")

    for item in additional_colleges_data:
        college = db.query(College).filter(College.slug == item["slug"]).first()
        if not college:
            college = College(
                name=item["name"],
                slug=item["slug"],
                domain=item["domain"],
                location=item["location"],
                established_year=item["established_year"],
                description=item["description"],
                is_approved=item["is_approved"],
                is_active=item["is_active"],
            )
            db.add(college)
            db.flush()

            branding = CollegeBranding(
                college_id=college.id,
                primary_color="#1e3a8a",
                secondary_color="#3b82f6",
                accent_color="#f59e0b",
                background_color="#f8fafc",
                welcome_message=f"Welcome to {college.name} Alumni Network",
                motto="Excellence Through Innovation",
            )
            db.add(branding)

            admin_data = item["admin"]
            admin_user = User(
                username=admin_data["username"],
                email=admin_data["email"],
                password_hash=default_password,
                college_id=college.id,
                role=UserRole.ADMIN,
                is_active=True,
                email_verified=True,
                email_verified_at=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            db.add(admin_user)
            db.flush()

            profile = Profile(
                user_id=admin_user.id,
                college_id=college.id,
                full_name=admin_data["full_name"],
                job_title=admin_data["job_title"],
                job_industry="Higher Education",
                location=item["location"],
            )
            db.add(profile)
            print(f"✅ Created College: {college.name} (slug: {college.slug}, active: {college.is_active})")
        colleges.append(college)

    db.commit()
    return colleges


def seed_demo_accounts_and_students(db: Session, college: College):
    """Seed dedicated 1-click demo accounts and student users in primary college."""
    shared_password_hash = hash_password("DevAlumni@2026!")

    # 1. Dedicated Demo Alumni
    demo_alumni = db.query(User).filter(User.username == "demo_alumni", User.college_id == college.id).first()
    if not demo_alumni:
        demo_alumni = User(
            username="demo_alumni",
            email="demo.alumni@nitk.edu.in",
            password_hash=shared_password_hash,
            college_id=college.id,
            role=UserRole.ALUMNI,
            is_active=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            alumni_status=AlumniStatus.APPROVED,
            alumni_requested_at=datetime.utcnow(),
            alumni_reviewed_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
        )
        db.add(demo_alumni)
        db.flush()
        alumni_profile = Profile(
            user_id=demo_alumni.id,
            college_id=college.id,
            full_name="Ananya Sen (Demo Alumni)",
            bio="Senior AI Engineer at Microsoft India. Passionate about LLMs and mentoring students.",
            company="Microsoft India",
            job_title="Senior AI Engineer",
            job_industry="Artificial Intelligence & Cloud",
            location="Bengaluru, Karnataka",
            skills=["Python", "PyTorch", "Azure AI", "Machine Learning", "System Design"],
            interests=["Generative AI", "Mentorship", "Robotics"],
            grad_year=2020,
            major="Computer Science and Engineering",
        )
        semantic_text = generate_semantic_text(alumni_profile)
        alumni_profile.semantic_hash = compute_semantic_hash(semantic_text)
        alumni_profile.embedding = get_embedding(semantic_text)
        db.add(alumni_profile)
        print("✅ Created Dedicated Demo Alumni: demo.alumni@nitk.edu.in")
    else:
        if demo_alumni.profile:
            semantic_text = generate_semantic_text(demo_alumni.profile)
            demo_alumni.profile.semantic_hash = compute_semantic_hash(semantic_text)
            demo_alumni.profile.embedding = get_embedding(semantic_text)

    # 2. Dedicated Demo Student
    demo_student = db.query(User).filter(User.username == "demo_student", User.college_id == college.id).first()
    if not demo_student:
        demo_student = User(
            username="demo_student",
            email="demo.student@nitk.edu.in",
            password_hash=shared_password_hash,
            college_id=college.id,
            role=UserRole.STUDENT,
            is_active=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            alumni_status=AlumniStatus.NOT_REQUESTED,
            created_at=datetime.utcnow(),
        )
        db.add(demo_student)
        db.flush()
        student_profile = Profile(
            user_id=demo_student.id,
            college_id=college.id,
            full_name="Rohan Mehta (Demo Student)",
            bio="Final year B.Tech student interested in Distributed Systems and Cloud Computing.",
            job_title="Final Year Undergraduate",
            job_industry="Higher Education",
            location="Mangalore, Karnataka",
            skills=["Python", "C++", "Docker", "SQL", "React"],
            interests=["Open Source", "Hackathons", "Cloud Computing"],
            grad_year=2026,
            major="Computer Science and Engineering",
        )
        semantic_text = generate_semantic_text(student_profile)
        student_profile.semantic_hash = compute_semantic_hash(semantic_text)
        student_profile.embedding = get_embedding(semantic_text)
        db.add(student_profile)
        print("✅ Created Dedicated Demo Student: demo.student@nitk.edu.in")
    else:
        if demo_student.profile:
            semantic_text = generate_semantic_text(demo_student.profile)
            demo_student.profile.semantic_hash = compute_semantic_hash(semantic_text)
            demo_student.profile.embedding = get_embedding(semantic_text)

    # 3. Additional realistic students for user management testing
    additional_students = [
        {
            "username": "aditi_verma",
            "email": "aditi.verma@student.nitk.edu.in",
            "full_name": "Aditi Verma",
            "major": "Mechanical Engineering",
            "grad_year": 2025,
            "skills": ["CAD/CAM", "MATLAB", "Finite Element Analysis"],
            "interests": ["Automotive Engineering", "Aerospace"],
            "alumni_status": AlumniStatus.PENDING,
        },
        {
            "username": "karan_patel",
            "email": "karan.patel@student.nitk.edu.in",
            "full_name": "Karan Patel",
            "major": "Information Technology",
            "grad_year": 2026,
            "skills": ["JavaScript", "TypeScript", "Node.js", "React"],
            "interests": ["Web Development", "UI/UX"],
            "alumni_status": AlumniStatus.NOT_REQUESTED,
        },
        {
            "username": "priya_nair",
            "email": "priya.nair@student.nitk.edu.in",
            "full_name": "Priya Nair",
            "major": "Electrical and Electronics Engineering",
            "grad_year": 2025,
            "skills": ["VLSI Design", "Verilog", "Embedded Systems"],
            "interests": ["Semiconductors", "IoT"],
            "alumni_status": AlumniStatus.NOT_REQUESTED,
        },
        {
            "username": "varun_singh",
            "email": "varun.singh@student.nitk.edu.in",
            "full_name": "Varun Singh",
            "major": "Chemical Engineering",
            "grad_year": 2027,
            "skills": ["Process Simulation", "Aspen Plus", "Fluid Mechanics"],
            "interests": ["Green Hydrogen", "Sustainability"],
            "alumni_status": AlumniStatus.NOT_REQUESTED,
        },
    ]

    for s in additional_students:
        existing = db.query(User).filter(User.username == s["username"], User.college_id == college.id).first()
        if not existing:
            u = User(
                username=s["username"],
                email=s["email"],
                password_hash=shared_password_hash,
                college_id=college.id,
                role=UserRole.STUDENT,
                is_active=True,
                email_verified=True,
                email_verified_at=datetime.utcnow(),
                alumni_status=s["alumni_status"],
                alumni_requested_at=datetime.utcnow() if s["alumni_status"] == AlumniStatus.PENDING else None,
                created_at=datetime.utcnow(),
            )
            db.add(u)
            db.flush()
            prof = Profile(
                user_id=u.id,
                college_id=college.id,
                full_name=s["full_name"],
                major=s["major"],
                grad_year=s["grad_year"],
                skills=s["skills"],
                interests=s["interests"],
                location="Mangalore, Karnataka",
                job_industry="Higher Education",
            )
            semantic_text = generate_semantic_text(prof)
            prof.semantic_hash = compute_semantic_hash(semantic_text)
            prof.embedding = get_embedding(semantic_text)
            db.add(prof)
            print(f"✅ Seeded student: {s['full_name']}")
        else:
            if existing.alumni_status != s["alumni_status"]:
                existing.alumni_status = s["alumni_status"]
                existing.alumni_requested_at = datetime.utcnow() if s["alumni_status"] == AlumniStatus.PENDING else None

    db.commit()

    # 4. Realistic connections for demo personas
    admin_nitk = db.query(User).filter(User.username == "admin_nitk", User.college_id == college.id).first()
    other_alumni = db.query(User).filter(User.role == UserRole.ALUMNI, User.college_id == college.id, User.username != "demo_alumni").first()
    aditi_user = db.query(User).filter(User.username == "aditi_verma", User.college_id == college.id).first()

    def ensure_connection(u1_id: int, u2_id: int, st: ConnectionStatus):
        if not u1_id or not u2_id or u1_id == u2_id:
            return
        conn = db.query(Connection).filter(
            ((Connection.sender_id == u1_id) & (Connection.receiver_id == u2_id)) |
            ((Connection.sender_id == u2_id) & (Connection.receiver_id == u1_id))
        ).first()
        if not conn:
            db.add(Connection(
                college_id=college.id,
                sender_id=u1_id,
                receiver_id=u2_id,
                status=st,
                created_at=datetime.utcnow(),
            ))

    # Connection 1: demo_student <-> demo_alumni (ACCEPTED)
    ensure_connection(demo_student.id, demo_alumni.id, ConnectionStatus.ACCEPTED)

    # Connection 2: demo_alumni <-> admin_nitk (ACCEPTED)
    if admin_nitk:
        ensure_connection(demo_alumni.id, admin_nitk.id, ConnectionStatus.ACCEPTED)

    # Connection 3: demo_alumni <-> another alumni (ACCEPTED)
    if other_alumni:
        ensure_connection(demo_alumni.id, other_alumni.id, ConnectionStatus.ACCEPTED)
        # Connection 4: other alumni -> demo_student (PENDING request for student to accept)
        ensure_connection(other_alumni.id, demo_student.id, ConnectionStatus.PENDING)

    # Connection 5: aditi_verma -> demo_alumni (PENDING request for demo alumni to accept)
    if aditi_user:
        ensure_connection(aditi_user.id, demo_alumni.id, ConnectionStatus.PENDING)

    # 5. Realistic posts
    alumni_post = db.query(Post).filter(Post.user_id == demo_alumni.id).first()
    if not alumni_post:
        db.add(Post(
            user_id=demo_alumni.id,
            content="🚀 Excited to announce that Microsoft India is hiring campus grads for Cloud and AI engineering roles! Reach out for referrals, mentorship, or resume feedback. Glad to give back to the NITK community! #Hiring #AI #CampusReferral",
            is_opportunity=True,
            created_at=datetime.utcnow(),
        ))
        print("✅ Seeded opportunity post for demo alumni")

    student_post = db.query(Post).filter(Post.user_id == demo_student.id).first()
    if not student_post:
        db.add(Post(
            user_id=demo_student.id,
            content="Just published our capstone project: High-throughput distributed cache in Go & Docker! Huge thanks to the alumni mentors who provided architecture feedback during the tech talks last month. #Projects #DistributedSystems #OpenSource",
            is_opportunity=False,
            created_at=datetime.utcnow(),
        ))
        print("✅ Seeded project post for demo student")

    db.commit()


def seed_college_requests(db: Session, super_admin: User | None = None):
    """Seed realistic college requests (pending, approved, rejected)."""
    sample_requests = [
        {
            "name": "Vellore Institute of Technology",
            "domain": "vit.ac.in",
            "location": "Vellore, Tamil Nadu",
            "established_year": 1984,
            "description": "Institution with expansive global alumni community and vibrant engineering programs.",
            "admin_name": "Dr. K. S. Parthasarathy",
            "admin_email": "alumni.dean@vit.ac.in",
            "status": CollegeRequestStatus.PENDING,
            "email_verified": True,
        },
        {
            "name": "Manipal Institute of Technology",
            "domain": "manipal.edu",
            "location": "Manipal, Karnataka",
            "established_year": 1957,
            "description": "Constituent institute of MAHE known for industry partnerships and alumni achievements.",
            "admin_name": "Prof. Sudheer Shenoy",
            "admin_email": "alumni.relations@manipal.edu",
            "status": CollegeRequestStatus.PENDING,
            "email_verified": True,
        },
        {
            "name": "Apex Global Tech Academy",
            "domain": "apexglobaltech.fake",
            "location": "Unverified Location",
            "established_year": 2024,
            "description": "Unregistered commercial tutorial site attempting to register as university.",
            "admin_name": "Unverified Requester",
            "admin_email": "fake.admin@tempmail.com",
            "status": CollegeRequestStatus.REJECTED,
            "email_verified": True,
            "rejection_reason": "Domain ownership and recognized accreditation could not be validated.",
            "reviewed_by": super_admin.id if super_admin else None,
            "reviewed_at": datetime.utcnow(),
        },
    ]

    pw_hash = hash_password("Admin@Request2026!")

    for req in sample_requests:
        existing = db.query(CollegeRequest).filter(CollegeRequest.domain == req["domain"]).first()
        if not existing:
            new_req = CollegeRequest(
                name=req["name"],
                domain=req["domain"],
                location=req["location"],
                established_year=req["established_year"],
                description=req["description"],
                admin_name=req["admin_name"],
                admin_email=req["admin_email"],
                password_hash=pw_hash,
                email_verified=req["email_verified"],
                email_verified_at=datetime.utcnow() if req["email_verified"] else None,
                status=req["status"],
                rejection_reason=req.get("rejection_reason"),
                reviewed_by=req.get("reviewed_by"),
                reviewed_at=req.get("reviewed_at"),
                created_at=datetime.utcnow(),
            )
            db.add(new_req)
            print(f"✅ Seeded College Request: {req['name']} ({req['status'].value})")

    db.commit()


def seed_all(db: Session, alumni_count: int = 85):
    """Seed super admin, demo super admin, college, college admin, alumni users, additional colleges, students, and requests."""
    print("🌱 Starting AlumniConn development database seeding...")
    super_admin = seed_super_admin(db)
    seed_demo_super_admin(db)
    college = seed_college(db)
    if college:
        admin = seed_college_admin(db, college)
        seed_alumni_users(db, college, admin, target_count=alumni_count)
        seed_demo_accounts_and_students(db, college)
    seed_additional_colleges(db)
    seed_college_requests(db, super_admin)
    print("✨ Seeding completed successfully!")


if __name__ == "__main__":
    from src.database.session import SessionLocal
    db = SessionLocal()
    try:
        seed_all(db, alumni_count=85)
    finally:
        db.close()

