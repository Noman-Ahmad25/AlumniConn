from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from dotenv import load_dotenv, find_dotenv

import os
from pathlib import Path

# Load from server/.env if not already set
if not os.getenv("DATABASE_URL"):
    server_env = Path(__file__).resolve().parent.parent.parent / ".env"
    if server_env.exists():
        load_dotenv(server_env)
    else:
        load_dotenv(find_dotenv())

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL or "sqlite:///:memory:",
        connect_args={"check_same_thread": False} if (DATABASE_URL and DATABASE_URL.startswith("sqlite")) else {},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        connect_args={"connect_timeout": 10},
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
