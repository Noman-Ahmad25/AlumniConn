import logging
import logging.config
import os
import sys

class KeyValueFormatter(logging.Formatter):
    """
    A custom formatter that formats standard logs and appends any extra fields 
    provided in the `extra` dictionary as key=value pairs.
    """
    
    # Standard attributes built into LogRecord
    _STANDARD_ATTRS = {
        'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
        'funcName', 'levelname', 'levelno', 'lineno', 'module',
        'msecs', 'message', 'msg', 'name', 'pathname', 'process',
        'processName', 'relativeCreated', 'stack_info', 'thread', 'threadName',
        'taskName', 'color_message'
    }

    def format(self, record: logging.LogRecord) -> str:
        # Format the base message natively
        msg = super().format(record)
        
        # Extract custom fields passed via extra={}
        extra_fields = {
            k: v for k, v in record.__dict__.items() 
            if k not in self._STANDARD_ATTRS
        }
        
        # If extras exist, format and append them
        if extra_fields:
            extra_str = " ".join(f"{k}={v}" for k, v in extra_fields.items())
            msg = f"{msg} {extra_str}"
            
        return msg


def setup_logging():
    """
    Configures centralized logging for the application and Uvicorn.
    """
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "structured": {
                "()": f"{__name__}.KeyValueFormatter",
                "fmt": "%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "structured",
            },
        },
        "loggers": {
            # Root logger gets everything not explicitly handled
            "": {
                "handlers": ["console"],
                "level": log_level,
            },
            # Uvicorn base logger
            "uvicorn": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False,
            },
            # Uvicorn error logger
            "uvicorn.error": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False,
            },
            # Uvicorn access logger
            "uvicorn.access": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False,
            },
        }
    }

    logging.config.dictConfig(logging_config)
