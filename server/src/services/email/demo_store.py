from dataclasses import dataclass, asdict
from datetime import datetime
import threading
from typing import List, Optional, Dict, Any


@dataclass
class DemoEmailEvent:
    id: str
    to_email: str
    subject: str
    html_body: str
    action_type: str  # "user_verification" | "password_reset" | "college_verification" | "college_approval" | "college_rejection" | "general"
    action_url: Optional[str]
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class DemoEmailStore:
    def __init__(self, max_items: int = 50):
        self._lock = threading.Lock()
        self._emails: List[DemoEmailEvent] = []
        self._counter = 1
        self._max_items = max_items

    def add_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        action_type: str = "general",
        action_url: Optional[str] = None,
    ) -> DemoEmailEvent:
        with self._lock:
            event = DemoEmailEvent(
                id=f"demo_email_{self._counter}",
                to_email=to_email,
                subject=subject,
                html_body=html_body,
                action_type=action_type,
                action_url=action_url,
                created_at=datetime.utcnow().isoformat(),
            )
            self._counter += 1
            self._emails.insert(0, event)
            if len(self._emails) > self._max_items:
                self._emails.pop()
            return event

    def get_emails(
        self, to_email: Optional[str] = None, limit: int = 20
    ) -> List[DemoEmailEvent]:
        with self._lock:
            if to_email:
                filtered = [
                    e for e in self._emails if e.to_email.lower() == to_email.lower().strip()
                ]
                return filtered[:limit]
            return list(self._emails[:limit])

    def clear(self):
        with self._lock:
            self._emails.clear()


demo_email_store = DemoEmailStore()
