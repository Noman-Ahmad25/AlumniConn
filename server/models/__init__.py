"""Compatibility aliases for tests that import models.*.

The application uses src.models.* as the canonical import path. Importing the
same SQLAlchemy models through both paths registers duplicate tables, so this
package maps legacy models.* imports back to src.models.* modules.
"""

from importlib import import_module
import sys


_MODEL_MODULES = (
    "alumni_request",
    "college",
    "college_request",
    "comment",
    "connection",
    "conversation",
    "like",
    "message",
    "post",
    "profile",
    "user",
)

for _module_name in _MODEL_MODULES:
    sys.modules[f"{__name__}.{_module_name}"] = import_module(f"src.models.{_module_name}")

