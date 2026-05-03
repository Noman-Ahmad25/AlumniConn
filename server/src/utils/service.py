import os, uuid, shutil
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Stores active connections: {user_id: WebSocket}
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_private_json(self, user_id: int, data: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(data)

# Initialize the instance
manager = ConnectionManager()

def save_uploads(file, folder: str):
    base = f"static/uploads/{folder}"
    os.makedirs(base, exist_ok=True)
    # Corrected splittext to splitext
    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"
    path = os.path.join(base, filename)
    
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"/static/uploads/{folder}/{filename}"