from .test_connections_multitenant import send_request
from .test_posts_likes_comments import create_post


def test_full_user_flow(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")

    profile = client.put(
        "/profile/me",
        headers=alice["headers"],
        json={
            "full_name": "Alice Flow",
            "bio": "Testing the full flow",
            "profile_picture": "https://example.com/alice-flow.png",
        },
    )
    assert profile.status_code == 200
    assert profile.json()["username"] == "alice"

    post = create_post(client, alice["headers"], "End-to-end post").json()

    liked = client.post(f"/likes/toggle/{post['id']}", headers=bob["headers"])
    assert liked.status_code == 200
    assert liked.json()["liked"] is True

    comment = client.post(
        "/comments/",
        headers=bob["headers"],
        json={"post_id": post["id"], "content": "Looks good"},
    )
    assert comment.status_code == 200
    assert comment.json()["username"] == "bob"

    request = send_request(client, bob, alice["id"])
    assert request.status_code == 200

    accepted = client.post(
        f"/connections/accept/{request.json()['id']}",
        headers=alice["headers"],
    )
    assert accepted.status_code == 200

    viewed_profile = client.get(f"/profile/{bob['id']}", headers=alice["headers"])
    assert viewed_profile.status_code == 200
    assert viewed_profile.json()["connection_status"] == "connected"

    feed = client.get("/posts/feed", headers=bob["headers"])
    feed_post = next(item for item in feed.json() if item["id"] == post["id"])
    assert feed_post["likes_count"] == 1
    assert feed_post["comments_count"] == 1
