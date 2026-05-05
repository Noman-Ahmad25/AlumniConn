import pytest
from starlette.websockets import WebSocketDisconnect

from .test_connections_multitenant import send_request


def _connect_users(client, alice, bob) -> int:
    request = send_request(client, alice, bob["id"])
    assert request.status_code == 200, request.text

    accepted = client.post(
        f"/connections/accept/{request.json()['id']}",
        headers=bob["headers"],
    )
    assert accepted.status_code == 200, accepted.text

    conversation = client.post(
        f"/messages/conversation/{bob['id']}",
        headers=alice["headers"],
    )
    assert conversation.status_code == 200, conversation.text
    return conversation.json()["conversation_id"]


def test_message_websocket_requires_valid_token(client):
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect("/messages/ws"):
            pass

    assert exc_info.value.code == 1008


def test_message_websocket_rejects_user_id_spoofing(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")

    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/messages/ws/{alice['id']}?token={bob['token']}"):
            pass

    assert exc_info.value.code == 1008


def test_message_websocket_delivers_to_all_user_connections(client, auth_factory):
    alice = auth_factory("alice", "one")
    bob = auth_factory("bob", "one")
    conversation_id = _connect_users(client, alice, bob)
    websocket_url = f"/messages/ws?token={bob['token']}"

    with client.websocket_connect(websocket_url) as first_socket:
        with client.websocket_connect(websocket_url) as second_socket:
            first_socket.send_json({"type": "ping"})
            assert first_socket.receive_json() == {"type": "pong"}

            response = client.post(
                "/messages/send",
                headers=alice["headers"],
                data={"conversation_id": str(conversation_id), "content": "Hello Bob"},
            )
            assert response.status_code == 200, response.text

            first_event = first_socket.receive_json()
            second_event = second_socket.receive_json()

    assert first_event["type"] == "new_msg"
    assert second_event["type"] == "new_msg"
    assert first_event["payload"]["content"] == "Hello Bob"
    assert second_event["payload"]["content"] == "Hello Bob"
    assert first_event["payload"]["conversation_id"] == conversation_id
