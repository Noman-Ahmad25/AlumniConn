from sqlalchemy.orm import Session
from src.models.user import User
from src.utils.security import hash_password # Ensure this path is correct
from datetime import datetime
import os

def seed_super_admin(db: Session):
    # Retrieve data from environment variables
    email = os.getenv("SUPER_ADMIN_EMAIL", "noman@gmail.com")
    username = os.getenv("SUPER_ADMIN_USERNAME", "noman")
    password = os.getenv("SUPER_ADMIN_PASSWORD", "noman123") # Fallback for dev
    role = "SUPER_ADMIN"

    # Check if exists to prevent duplicates
    admin = db.query(User).filter(User.email == email).first()
    
    if not admin:
        new_admin = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            college_id=None, 
            role=role,
            is_active=True,
            created_at=datetime.now()
        )
        db.add(new_admin)
        try:
            db.commit()
            print(f"✅ Created Super Admin: {email}")
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to seed Super Admin: {e}")
    else:
        print(f"ℹ️ Super Admin {email} already exists. Skipping.")
