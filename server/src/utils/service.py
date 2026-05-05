from pathlib import Path

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # A user can be online from multiple tabs/devices at once.
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        sockets = self.active_connections.get(user_id)
        if not sockets:
            return
        if websocket in sockets:
            sockets.remove(websocket)
        if not sockets:
            self.active_connections.pop(user_id, None)

    async def send_private_json(self, user_id: int, data: dict):
        for websocket in list(self.active_connections.get(user_id, [])):
            try:
                await websocket.send_json(data)
            except RuntimeError:
                self.disconnect(user_id, websocket)

# Initialize the instance
manager = ConnectionManager()
