import os
import logging
from jinja2 import Environment, FileSystemLoader
from src.services.email.provider import EmailProvider
from src.services.email.mock_provider import MockEmailProvider
from src.services.email.resend_provider import ResendEmailProvider
from src.services.email.smtp_provider import SMTPEmailProvider


# We can instantiate the provider based on environment variables
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "mock").lower()
if EMAIL_PROVIDER == "mock":
    _provider = MockEmailProvider()
elif EMAIL_PROVIDER == "smtp":
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    
    # Cast port to an integer and fall back to 587 if missing or invalid
    try:
        SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        SMTP_PORT = 587
        
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Added password extraction
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
    
    # Pass arguments matching the updated SMTPEmailProvider constructor signature
    _provider = SMTPEmailProvider(
        smtp_server=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        from_email=SMTP_FROM_EMAIL
    )
else:
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    _provider = ResendEmailProvider(api_key=RESEND_API_KEY, from_email="nomanahmad9356@gmail.com")


# Setup Jinja2 environment
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../templates/emails")
env = Environment(loader=FileSystemLoader(template_dir))


logger = logging.getLogger(__name__)

logger.info("Email provider: %s", type(_provider).__name__)

class EmailService:
    """
    Service responsible for rendering email templates and dispatching them to the configured provider.
    """
    
    @classmethod
    async def send_user_verification(cls, to_email: str, token: str, username: str,  college_slug: str) -> bool:
        """
        Sends the email verification link to a normal user.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        verification_link = f"{frontend_url}/c/{college_slug}/verify-email?token={token}"
        
        template = env.get_template("verification.html")
        html_body = template.render(username=username, verification_link=verification_link)
        
        return await _provider.send_email(
            to_email=to_email,
            subject="Verify your AlumniConn account",
            html_body=html_body
        )
        
    @classmethod
    async def send_college_verification(cls, to_email: str, token: str, college_name: str) -> bool:
        """
        Sends the email verification link for a college request.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        verification_link = f"{frontend_url}/verify-college-email?token={token}"
        
        template = env.get_template("college_verification.html")
        html_body = template.render(college_name=college_name, verification_link=verification_link)
        
        return await _provider.send_email(
            to_email=to_email,
            subject="Verify your College Registration Request",
            html_body=html_body
        )

    @classmethod
    async def send_password_reset(cls, to_email: str, token: str, username: str, college_slug: str) -> bool:
        """
        Sends the password reset link to a user.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        # Route respects the college slug
        reset_link = f"{frontend_url}/c/{college_slug}/reset-password?token={token}"
        
        template = env.get_template("password_reset.html")
        html_body = template.render(username=username, reset_link=reset_link)
        
        return await _provider.send_email(
            to_email=to_email,
            subject="Reset your password",
            html_body=html_body
        )

    @classmethod
    async def send_college_approval_email(cls, to_email: str, college_name: str, college_slug: str):
        """
        Sends college approval email.
        """
        template = env.get_template("college_approval.html")

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        login_url = f"{frontend_url}/c/{college_slug}/login"
        html_body = template.render(
            college_name=college_name,
            login_url = login_url
        )
        
        return await _provider.send_email(
            to_email=to_email,
            subject=f"{college_name} college request - Further information needed",
            html_body=html_body
        )
         
    @classmethod
    async def send_college_rejection_email(cls, to_email: str, college_name: str, reason: str | None = None) -> bool:
        """
        Sends college rejection email.
        """
        template = env.get_template("college_rejection.html")
        
        reason_text = f"Reason: {reason}" if reason else "Please contact our support team for more details."
        
        template = env.get_template("college_rejection.html")
        html_body = template.render(
            college_name=college_name,
            reason_text=reason_text
        )
        
        return await _provider.send_email(
            to_email=to_email,
            subject=f"{college_name} college request - Further information needed",
            html_body=html_body
        )
