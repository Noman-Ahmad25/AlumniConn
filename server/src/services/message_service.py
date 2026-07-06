from sqlalchemy.orm import Session
from fastapi import UploadFile
from src.models.message import Message
from src.models.user import User
from src.models.connection import Connection, ConnectionStatus
from src.models.conversation import Conversation
from src.models.profile import Profile
from src.utils.service import manager
from src.services.cloudinary_service import upload_image
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType

async def send_message(
    db: Session,
    current_user: User,
    conversation_id: int,
    content: str | None,
    image: UploadFile = None,
):
    if not content and not image:
        raise ValueError("Message must have content or an image")

    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.college_id == current_user.college_id,
    ).first()

    if not convo:
        raise ValueError("Conversation not found")

    if current_user.id not in [convo.user1_id, convo.user2_id]:
        raise ValueError("Not authorized to post in this chat")

    url = None
    if image:
        url = upload_image(image, "alumniconn/messages")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=content or "",
        image_url=url,
        college_id=current_user.college_id,
    )

    db.add(msg)
    db.commit()
    db.refresh(msg)

    recipient_id = convo.user2_id if convo.user1_id == current_user.id else convo.user1_id

    payload = {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "content": msg.content,
        "image_url": msg.image_url,
        "timestamp": msg.timestamp.isoformat(),
        "sender": {
            "id": current_user.id,
            "username": current_user.username,
            "profile_picture": (
                current_user.profile.profile_picture if current_user.profile else None
            ),
        },
    }

    await manager.send_private_json(recipient_id, {"type": "new_msg", "payload": payload})
    await manager.send_private_json(current_user.id, {"type": "new_msg", "payload": payload})
    
    event_bus.publish(NotificationType.MESSAGE_RECEIVED.value, {
        "recipient_id": recipient_id,
        "notification_type": NotificationType.MESSAGE_RECEIVED,
        "title": "New Message",
        "message": f"{current_user.username} sent you a message.",
        "actor_id": current_user.id,
        "metadata_": {"conversation_id": conversation_id, "message_id": msg.id}
    })
    
    return msg


def get_messages(db: Session, current_user: User, conversation_id: int):
    # Verify the current user is a participant before returning messages
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.college_id == current_user.college_id,
    ).first()

    if not convo:
        raise ValueError("Conversation not found")

    if current_user.id not in [convo.user1_id, convo.user2_id]:
        raise ValueError("Not authorized to view this conversation")

    rows = (
        db.query(Message, User, Profile)
        .join(User, Message.sender_id == User.id)
        .outerjoin(Profile, Profile.user_id == User.id)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    return [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "content": m.content,
            "image_url": m.image_url,
            "timestamp": m.timestamp,
            "sender": {
                "id": u.id,
                "username": u.username,
                "profile_picture": p.profile_picture if p else None,
            },
        }
        for m, u, p in rows
    ]


def get_inbox(db: Session, current_user: User):
    # Single query joining everything needed — avoids N+1
    conversations = (
        db.query(Conversation)
        .filter(
            Conversation.college_id == current_user.college_id,
            (Conversation.user1_id == current_user.id)
            | (Conversation.user2_id == current_user.id),
        )
        .all()
    )

    if not conversations:
        return []

    convo_ids = [c.id for c in conversations]

    # Fetch last message per conversation via a subquery
    from sqlalchemy import func

    latest_msg_subq = (
        db.query(
            Message.conversation_id,
            func.max(Message.id).label("max_id"),
        )
        .filter(Message.conversation_id.in_(convo_ids))
        .group_by(Message.conversation_id)
        .subquery()
    )

    last_messages: dict[int, Message] = {
        m.conversation_id: m
        for m in db.query(Message).join(
            latest_msg_subq,
            (Message.conversation_id == latest_msg_subq.c.conversation_id)
            & (Message.id == latest_msg_subq.c.max_id),
        )
    }

    # Collect other-user ids
    other_ids = [
        (c.user2_id if c.user1_id == current_user.id else c.user1_id)
        for c in conversations
    ]

    other_users: dict[int, tuple[User, Profile | None]] = {}
    rows = (
        db.query(User, Profile)
        .outerjoin(Profile, Profile.user_id == User.id)
        .filter(User.id.in_(other_ids))
        .all()
    )
    for u, p in rows:
        other_users[u.id] = (u, p)

    result = []
    for convo in conversations:
        other_id = convo.user2_id if convo.user1_id == current_user.id else convo.user1_id
        if other_id not in other_users:
            continue
        u, p = other_users[other_id]
        last_msg = last_messages.get(convo.id)
        result.append(
            {
                "conversation_id": convo.id,
                "user_id": u.id,
                "username": u.username,
                "profile_picture": p.profile_picture if p else None,
                "last_message": last_msg.content if last_msg else "",
                "last_time": last_msg.timestamp if last_msg else None,
            }
        )

    # Sort by most recent first
    result.sort(key=lambda x: x["last_time"] or "", reverse=True)
    return result


def get_or_create_conversation(db: Session, current_user: User, other_user_id: int):
    if current_user.id == other_user_id:
        raise ValueError("Cannot message yourself")

    connected = db.query(Connection).filter(
        Connection.college_id == current_user.college_id,
        Connection.status == ConnectionStatus.ACCEPTED,
        (
            (Connection.sender_id == current_user.id)
            & (Connection.receiver_id == other_user_id)
        )
        | (
            (Connection.sender_id == other_user_id)
            & (Connection.receiver_id == current_user.id)
        ),
    ).first()

    if not connected:
        raise ValueError("You must be connected to chat")

    convo = db.query(Conversation).filter(
        Conversation.college_id == current_user.college_id,
        (
            (Conversation.user1_id == current_user.id)
            & (Conversation.user2_id == other_user_id)
        )
        | (
            (Conversation.user1_id == other_user_id)
            & (Conversation.user2_id == current_user.id)
        ),
    ).first()

    if not convo:
        convo = Conversation(
            user1_id=current_user.id,
            user2_id=other_user_id,
            college_id=current_user.college_id,
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)
    return convo