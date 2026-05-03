def send_request(client, sender, receiver_id):
    return client.post(
        "/connections/",
        headers=sender["headers"],
        json={"receiver_id": receiver_id},
    )


def test_connection_request_lifecycle_and_discover_users(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    carol = auth_factory("carol", "one")

    discover = client.get("/users/discover", headers=alice["headers"])
    assert discover.status_code == 200
    discover_by_id = {user["id"]: user for user in discover.json()}
    assert alice["id"] not in discover_by_id
    assert discover_by_id[bob["id"]]["connection_status"] == "none"
    assert discover_by_id[carol["id"]]["connection_status"] == "none"

    self_request = send_request(client, alice, alice["id"])
    assert self_request.status_code == 400

    request = send_request(client, alice, bob["id"])
    assert request.status_code == 200
    connection_id = request.json()["id"]

    duplicate = send_request(client, alice, bob["id"])
    assert duplicate.status_code == 400

    alice_discover = client.get("/users/discover", headers=alice["headers"]).json()
    bob_in_alice_discover = next(user for user in alice_discover if user["id"] == bob["id"])
    assert bob_in_alice_discover["connection_status"] == "pending_sent"

    bob_requests = client.get("/connections/requests", headers=bob["headers"])
    assert bob_requests.status_code == 200
    assert bob_requests.json()[0]["user"]["username"] == "alice"

    bob_discover = client.get("/users/discover", headers=bob["headers"]).json()
    alice_in_bob_discover = next(user for user in bob_discover if user["id"] == alice["id"])
    assert alice_in_bob_discover["connection_status"] == "pending_received"

    accepted = client.post(f"/connections/accept/{connection_id}", headers=bob["headers"])
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "accepted"

    alice_connections = client.get("/connections/", headers=alice["headers"])
    assert alice_connections.status_code == 200
    assert alice_connections.json()[0]["user"]["username"] == "bob"

    discover_after_accept = client.get("/users/discover", headers=alice["headers"]).json()
    assert bob["id"] not in {user["id"] for user in discover_after_accept}


def test_reject_request_removes_pending_request(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    request = send_request(client, alice, bob["id"]).json()

    rejected = client.post(f"/connections/reject/{request['id']}", headers=bob["headers"])

    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"
    assert client.get("/connections/requests", headers=bob["headers"]).json() == []


def test_connections_are_tenant_scoped(client, auth_factory):
    alice = auth_factory("alice", "one")
    outsider = auth_factory("outsider", "two")

    request = send_request(client, alice, outsider["id"])

    assert request.status_code == 400
    discover = client.get("/users/discover", headers=alice["headers"])
    assert outsider["id"] not in {user["id"] for user in discover.json()}


def test_invalid_inputs_and_forbidden_connection_actions(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    carol = auth_factory("carol", "one")
    request = send_request(client, alice, bob["id"]).json()

    invalid_payload = client.post("/connections/", headers=alice["headers"], json={})
    assert invalid_payload.status_code == 422

    forbidden_accept = client.post(
        f"/connections/accept/{request['id']}",
        headers=carol["headers"],
    )
    assert forbidden_accept.status_code == 400
