from models.profile import Profile

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
