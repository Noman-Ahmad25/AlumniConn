from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.schemas.message import MessageResponse, InboxMessage
from src.utils.dependency import get_current_user
from src.database.session import get_db
from src.models.user import User
from src.services.message_service import (
    send_message,
    get_messages,
    get_inbox,
    get_or_create_conversation,
)
from src.utils.service import manager
import json

router = APIRouter()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time messaging."""
    try:
        await manager.connect(websocket, user_id)
        while True:
            try:
                data = await websocket.receive_text()
                # Accept optional ping/keep-alive JSON from client
                try:
                    parsed = json.loads(data)
                    if parsed.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                except (json.JSONDecodeError, AttributeError):
                    pass
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket receive error for user {user_id}: {e}")
                break
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket connection error for user {user_id}: {e}")
    finally:
        manager.disconnect(user_id)


@router.post("/conversation/{user_id}")
def start_chat(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        convo = get_or_create_conversation(db, current_user, user_id)
        return {"conversation_id": convo.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/send", response_model=MessageResponse)
async def send_msg(
    conversation_id: int = Form(...),
    content: str | None = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await send_message(db, current_user, conversation_id, content, image)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/chat/{conversation_id}", response_model=list[MessageResponse])
def get_chat(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_messages(db, current_user, conversation_id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/inbox", response_model=list[InboxMessage])
def inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_inbox(db, current_user)