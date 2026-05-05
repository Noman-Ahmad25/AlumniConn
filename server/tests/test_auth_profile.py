from models.profile import Profile
from src.models.user import User, UserRole
from src.utils.security import decode_access_token, hash_password

from .conftest import login_user, register_user


def test_register_creates_user_and_profile(client, db_session, colleges):
    college_id = colleges["one"].id

    response = register_user(client, "alice", "alice@test.edu", college_id)

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "alice"

    profile = db_session.query(Profile).filter(Profile.user_id == body["id"]).first()
    assert profile is not None
    assert profile.full_name == "alice"


def test_login_returns_token_and_invalid_login_fails(client, colleges):
    college_id = colleges["one"].id
    register_user(client, "alice", "alice@test.edu", college_id)

    token = login_user(client, "alice@test.edu", college_id)
    assert token

    bad_login = client.post(
        "/auth/login",
        json={"email": "alice@test.edu", "password": "wrong", "college_id": college_id},
    )
    assert bad_login.status_code == 401


def test_admin_login_returns_valid_role_jwt(client, db_session, colleges):
    college_id = colleges["one"].id
    password = "adminpass123"
    db_session.add(
        User(
            username="college_admin",
            email="admin@test.edu",
            password_hash=hash_password(password),
            college_id=college_id,
            role=UserRole.ADMIN,
            is_active=True,
        )
    )
    db_session.commit()

    response = client.post(
        "/auth/login",
        json={"email": "admin@test.edu", "password": password, "college_id": college_id},
    )

    assert response.status_code == 200, response.text
    payload = decode_access_token(response.json()["access_token"])
    assert payload["user_id"]
    assert payload["college_id"] == college_id
    assert payload["role"] == "admin"


def test_super_admin_login_allows_tenantless_user(client, db_session):
    password = "superpass123"
    db_session.add(
        User(
            username="super_admin",
            email="superadmin@example.com",
            password_hash=hash_password(password),
            college_id=None,
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
    )
    db_session.commit()

    response = client.post(
        "/auth/super-admin/login",
        json={"email": "superadmin@example.com", "password": password},
    )

    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    payload = decode_access_token(token)
    assert payload["college_id"] is None
    assert payload["role"] == "super_admin"

    college_requests = client.get(
        "/college-requests/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert college_requests.status_code == 200, college_requests.text


def test_token_required_endpoint_returns_401(client):
    response = client.get("/profile/me")

    assert response.status_code == 401


def test_profile_me_returns_username_and_updates_profile(client, auth_factory):
    alice = auth_factory("alice")

    initial = client.get("/profile/me", headers=alice["headers"])
    assert initial.status_code == 200
    assert initial.json()["username"] == "alice"
    assert initial.json()["profile_picture"] is None

    update = client.put(
        "/profile/me",
        headers=alice["headers"],
        json={
            "full_name": "Alice Example",
            "bio": "Backend-friendly profile",
            "profile_picture": "https://example.com/alice.jpg",
            "company": "AlumniConn",
            "job_title": "Engineer",
            "job_industry": "Software",
            "job_description": "Builds useful things",
            "location": "Lahore",
        },
    )

    assert update.status_code == 200
    body = update.json()
    assert body["username"] == "alice"
    assert body["full_name"] == "Alice Example"
    assert body["profile_picture"] == "https://example.com/alice.jpg"
    assert body["connection_status"] == "self"
