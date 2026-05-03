import os
from collections.abc import Generator

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import app
from src.database.base import Base
from src.database.session import get_db
from models.college import College


TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite://")

if TEST_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def colleges(db_session: Session) -> dict[str, College]:
    college_one = College(
        name="Test College",
        location="Test City",
        established_year=2001,
        domain="test.edu",
        description="Primary test tenant",
    )
    college_two = College(
        name="Other College",
        location="Other City",
        established_year=2002,
        domain="other.edu",
        description="Secondary test tenant",
    )
    db_session.add_all([college_one, college_two])
    db_session.commit()
    db_session.refresh(college_one)
    db_session.refresh(college_two)
    return {"one": college_one, "two": college_two}


def register_user(client: TestClient, username: str, email: str, college_id: int, password: str = "password123"):
    return client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
            "college_id": college_id,
            "role": "student",
        },
    )


def login_user(client: TestClient, email: str, college_id: int, password: str = "password123") -> str:
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
            "college_id": college_id,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.fixture()
def auth_factory(client: TestClient, colleges: dict[str, College]):
    def factory(username: str, college_key: str = "one") -> dict:
        college = colleges[college_key]
        email = f"{username}@{college.domain}"
        response = register_user(client, username, email, college.id)
        assert response.status_code == 201, response.text
        token = login_user(client, email, college.id)
        return {
            "id": response.json()["id"],
            "username": username,
            "email": email,
            "college_id": college.id,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
        }

    return factory
