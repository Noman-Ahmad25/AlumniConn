from typing import Dict, Any

class PresenceManager:
    def __init__(self):
        # Maps user_id to their active context dict
        self._active_contexts: Dict[int, Dict[str, Any]] = {}

    def set_presence(self, user_id: int, context: Dict[str, Any]):
        self._active_contexts[user_id] = context

    def get_presence(self, user_id: int) -> Dict[str, Any]:
        return self._active_contexts.get(user_id, {})

    def clear_presence(self, user_id: int):
        self._active_contexts.pop(user_id, None)

presence_manager = PresenceManager()
