import resend
import logging
from src.services.email.provider import EmailProvider

logger = logging.getLogger(__name__)

class ResendEmailProvider(EmailProvider):
    """
    Email provider using the Resend API.
    """
    
    def __init__(self, api_key: str, from_email: str):
        self.api_key = api_key
        self.from_email = from_email
        resend.api_key = self.api_key
        
    async def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            }
            # Note: The official python SDK might be sync, but network IO should not block
            # For this MVP we'll call it directly. In production, this can be wrapped in run_in_executor
            # if the SDK is strictly synchronous.
            email = resend.Emails.send(params)
            logger.info("Successfully sent email via Resend", extra={"to_email": to_email, "email_id": email.get('id', 'unknown')})
            return True
        except Exception as e:
            logger.exception("Failed to send email via Resend", extra={"to_email": to_email})
            return False
