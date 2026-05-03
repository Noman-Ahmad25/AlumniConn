def create_post(client, token_headers, content="Hello world", image_url=None):
    return client.post(
        "/posts/",
        headers=token_headers,
        json={
            "content": content,
            "image_url": image_url,
            "is_opportunity": False,
        },
    )


def test_create_post_reject_empty_and_feed_filters_by_college(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    charlie = auth_factory("charlie", "two")

    empty = client.post(
        "/posts/",
        headers=alice["headers"],
        json={"content": None, "image_url": None, "is_opportunity": False},
    )
    assert empty.status_code == 422

    alice_post = create_post(client, alice["headers"], "Alice post")
    assert alice_post.status_code == 200
    create_post(client, bob["headers"], "Bob post")
    create_post(client, charlie["headers"], "Other college post")

    feed = client.get("/posts/feed", headers=alice["headers"])
    assert feed.status_code == 200
    contents = {post["content"] for post in feed.json()}
    assert contents == {"Alice post", "Bob post"}
    assert "Other college post" not in contents


def test_user_posts_are_tenant_filtered(client, auth_factory):
    alice = auth_factory("alice", "one")
    charlie = auth_factory("charlie", "two")
    create_post(client, charlie["headers"], "Private to other college")

    response = client.get(f"/posts/user/{charlie['id']}", headers=alice["headers"])

    assert response.status_code == 200
    assert response.json() == []


def test_toggle_like_updates_feed_counts_and_current_user_flag(client, auth_factory):
    alice = auth_factory("alice")
    bob = auth_factory("bob")
    post = create_post(client, bob["headers"], "Please like this").json()

    like = client.post(f"/likes/toggle/{post['id']}", headers=alice["headers"])
    assert like.status_code == 200
    assert like.json()["liked"] is True

    feed = client.get("/posts/feed", headers=alice["headers"]).json()
    liked_post = next(item for item in feed if item["id"] == post["id"])
    assert liked_post["likes_count"] == 1
    assert liked_post["liked_by_current_user"] is True

    unlike = client.post(f"/likes/toggle/{post['id']}", headers=alice["headers"])
    assert unlike.status_code == 200
    assert unlike.json()["liked"] is False


def test_comments_include_identity_and_reject_invalid_or_cross_college_posts(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    charlie = auth_factory("charlie", "two")
    post = create_post(client, bob["headers"], "Comment here").json()
    other_college_post = create_post(client, charlie["headers"], "Do not comment").json()

    profile_update = client.put(
        "/profile/me",
        headers=alice["headers"],
        json={"profile_picture": "https://example.com/alice.png"},
    )
    assert profile_update.status_code == 200

    created = client.post(
        "/comments/",
        headers=alice["headers"],
        json={"post_id": post["id"], "content": "Nice post"},
    )
    assert created.status_code == 200
    assert created.json()["username"] == "alice"
    assert created.json()["profile_picture"] == "https://example.com/alice.png"

    comments = client.get(f"/comments/{post['id']}", headers=bob["headers"])
    assert comments.status_code == 200
    assert comments.json()[0]["content"] == "Nice post"

    invalid = client.post(
        "/comments/",
        headers=alice["headers"],
        json={"post_id": 99999, "content": "Nope"},
    )
    assert invalid.status_code == 400

    cross_college = client.post(
        "/comments/",
        headers=alice["headers"],
        json={"post_id": other_college_post["id"], "content": "Nope"},
    )
    assert cross_college.status_code == 400
