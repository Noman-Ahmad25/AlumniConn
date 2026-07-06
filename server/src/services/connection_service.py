from sqlalchemy.orm import Session, joinedload
from src.models.connection import Connection, ConnectionStatus
from src.models.user import User
from src.utils.dependency import format_connection
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType


# send connection request
def send_request(db: Session, current_user: User, receiver_id: int):
    if current_user.id == receiver_id:
        raise ValueError("Cannot send connection request to yourself.")
        
    # SECURITY CHECK 1: Does the receiver actually exist IN THE SAME COLLEGE?
    receiver = db.query(User).filter(
        User.id == receiver_id, 
        User.college_id == current_user.college_id
    ).first()
    
    if not receiver:
        raise ValueError("User not found or does not belong to your college.")

    # SECURITY CHECK 2: Include college_id in the existing connection check
    existing = db.query(Connection).filter(
        Connection.college_id == current_user.college_id,
        ((Connection.sender_id == current_user.id) & (Connection.receiver_id == receiver_id)) |
        ((Connection.sender_id == receiver_id) & (Connection.receiver_id == current_user.id))
    ).first()
    
    if existing:
        raise ValueError("Connection request already exists.")
        
    # INJECT TENANT ID: Auto-assign the college_id so the frontend can't spoof it
    new_conn = Connection(
        sender_id=current_user.id, 
        receiver_id=receiver_id,
        college_id=current_user.college_id 
    )
    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)
    
    event_bus.publish(NotificationType.CONNECTION_RECEIVED.value, {
        "recipient_id": receiver_id,
        "notification_type": NotificationType.CONNECTION_RECEIVED,
        "title": "New Connection Request",
        "message": f"{current_user.username} sent you a connection request.",
        "actor_id": current_user.id,
        "metadata_": {"connection_id": new_conn.id}
    })
    
    return format_connection(new_conn, current_user)

# accept connection request
def accept_request(db: Session, connection_id: int, current_user: User):
    # SECURITY CHECK: Ensure this connection actually belongs to this college
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.college_id == current_user.college_id
    ).first()
    if not connection:
        raise ValueError("Connection request not found.")
    if connection.status != ConnectionStatus.PENDING:
        raise ValueError("Request already handled.")
    if connection.receiver_id != current_user.id:
        raise ValueError("Only the receiver can accept the connection request.")
        
    connection.status = ConnectionStatus.ACCEPTED
    db.commit()
    db.refresh(connection)
    
    event_bus.publish(NotificationType.CONNECTION_ACCEPTED.value, {
        "recipient_id": connection.sender_id,
        "notification_type": NotificationType.CONNECTION_ACCEPTED,
        "title": "Connection Request Accepted",
        "message": f"{current_user.username} accepted your connection request.",
        "actor_id": current_user.id,
        "metadata_": {"connection_id": connection.id}
    })
    
    return format_connection(connection, current_user)

# reject connection request
def reject_request(db: Session, connection_id: int, current_user: User):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.college_id == current_user.college_id
    ).first()

    if not connection:
        raise ValueError("Connection request not found.")
    if connection.status != ConnectionStatus.PENDING:
        raise ValueError("Request already handled.")
    if connection.receiver_id != current_user.id:
        raise ValueError("Only the receiver can reject the connection request.")
        
    connection.status = ConnectionStatus.REJECTED
    db.commit()
    db.refresh(connection)
    
    event_bus.publish(NotificationType.CONNECTION_REJECTED.value, {
        "recipient_id": connection.sender_id,
        "notification_type": NotificationType.CONNECTION_REJECTED,
        "title": "Connection Request Rejected",
        "message": f"{current_user.username} rejected your connection request.",
        "actor_id": current_user.id,
        "metadata_": {"connection_id": connection.id}
    })
    
    return format_connection(connection, current_user)


# list connections for a user
def get_connections(db: Session, current_user: User):
    connections = db.query(Connection).options(
        joinedload(Connection.sender).joinedload(User.profile),
        joinedload(Connection.receiver).joinedload(User.profile),
    ).filter(
        Connection.college_id == current_user.college_id, # Lock to tenant
        (Connection.sender_id == current_user.id) | (Connection.receiver_id == current_user.id), 
        Connection.status == ConnectionStatus.ACCEPTED
    ).all()
    
    return [format_connection(c, current_user) for c in connections]

# list pending connection requests for a user
def get_pending_requests(db: Session, current_user: User):
    connections = db.query(Connection).options(
        joinedload(Connection.sender).joinedload(User.profile),
        joinedload(Connection.receiver).joinedload(User.profile),
    ).filter(
        Connection.college_id == current_user.college_id, # Lock to tenant
        Connection.receiver_id == current_user.id, 
        Connection.status == ConnectionStatus.PENDING
    ).all()
    
    return [format_connection(c, current_user) for c in connections]
