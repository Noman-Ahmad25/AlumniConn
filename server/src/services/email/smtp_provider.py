import logging
import smtplib
import ssl
from email.message import EmailMessage
from src.services.email.provider import EmailProvider

logger = logging.getLogger(__name__)

class SMTPEmailProvider(EmailProvider):
    def __init__(self, smtp_server: str, port: int, username: str, password: str, from_email: str):
        self.smtp_server = smtp_server
        self.port = port
        self.username = username
        self.password = password
        self.from_email = from_email

    async def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        msg = EmailMessage()
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(html_body, subtype="html")

        try:
            context = ssl.create_default_context()
            
            # Use standard SMTP for Port 587 (STARTTLS)
            with smtplib.SMTP(self.smtp_server, self.port) as server:
                server.starttls(context=context)  # Upgrade connection to secure TLS
                server.login(self.username, self.password)
                server.send_message(msg)
                
            logger.info("Successfully sent email via Gmail SMTP", extra={"to_email": to_email})
            return True
        except Exception as e:
            logger.exception("Failed to send email via Gmail SMTP", extra={"to_email": to_email})
            return False
