from typing import Protocol, Callable, Any, Dict, List
import logging

logger = logging.getLogger(__name__)

class EventBus(Protocol):
    def publish(self, topic: str, event: Any) -> None:
        ...

    def subscribe(self, topic: str, handler: Callable) -> None:
        ...

class InMemoryEventBus(EventBus):
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, topic: str, handler: Callable) -> None:
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(handler)
        logger.debug(f"Subscribed to {topic}")

    def publish(self, topic: str, event: Any) -> None:
        logger.debug(f"Publishing event to {topic}")
        handlers = self._subscribers.get(topic, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Error handling event {topic}: {e}")

# Global instance for now
event_bus = InMemoryEventBus()
