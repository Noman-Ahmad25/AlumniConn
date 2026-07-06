import logging
from src.services.email.provider import EmailProvider

logger = logging.getLogger(__name__)

class MockEmailProvider(EmailProvider):
    """
    A mock email provider for local development and testing.
    It simply logs the email contents instead of sending them.
    """
    
    def __init__(self):
        logger.info("Initialized MockEmailProvider")
        
    async def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        logger.info(f"--- MOCK EMAIL ---")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body: {html_body[:100]}...")
        logger.info(f"------------------")
        return True
