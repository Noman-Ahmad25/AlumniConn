from typing import Callable, Any
from fastapi import BackgroundTasks
import logging

logger = logging.getLogger(__name__)

class AbstractTaskDispatcher:
    def dispatch(self, task: Callable, *args: Any, **kwargs: Any) -> None:
        raise NotImplementedError

class ThreadPoolDispatcher(AbstractTaskDispatcher):
    """
    Temporary dispatcher that uses FastAPI's BackgroundTasks.
    To be replaced by CeleryDispatcher when scaling to multiple worker nodes.
    """
    def __init__(self, background_tasks: BackgroundTasks):
        self.background_tasks = background_tasks

    def dispatch(self, task: Callable, *args: Any, **kwargs: Any) -> None:
        logger.debug(f"Dispatching task {task.__name__} to ThreadPoolDispatcher")
        self.background_tasks.add_task(task, *args, **kwargs)

def get_task_dispatcher(background_tasks: BackgroundTasks) -> AbstractTaskDispatcher:
    """Dependency injection factory for the task dispatcher."""
    return ThreadPoolDispatcher(background_tasks)
