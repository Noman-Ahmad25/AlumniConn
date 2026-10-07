import logging
import re
from typing import Any
from src.services.email.provider import EmailProvider
from src.services.email.demo_store import demo_email_store

logger = logging.getLogger(__name__)


class DemoEmailProvider(EmailProvider):
    """
    Demo email provider for local development, audits, and live preview.
    Stores email events in DemoEmailStore so the UI can present interactive
    verification and password-reset links without requiring an external email service.
    """

    def __init__(self):
        logger.info("Initialized DemoEmailProvider (intercepting emails for interactive live demo)")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        action_type: str = "general",
        action_url: str | None = None,
        **kwargs: Any,
    ) -> bool:
        # If action_url was not explicitly supplied, extract first link from html_body
        if not action_url:
            match = re.search(r'href="([^"]+)"', html_body)
            if match:
                action_url = match.group(1)

        event = demo_email_store.add_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            action_type=action_type,
            action_url=action_url,
        )

        logger.info("--- DEMO EMAIL INTERCEPTED ---")
        logger.info(f"ID: {event.id} | To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Action Type: {action_type} | Action URL: {action_url}")
        logger.info("-------------------------------")
        return True
