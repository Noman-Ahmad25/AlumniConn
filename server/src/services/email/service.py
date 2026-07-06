import os
from jinja2 import Environment, FileSystemLoader
from src.services.email.provider import EmailProvider
from src.services.email.mock_provider import MockEmailProvider
from src.services.email.resend_provider import ResendEmailProvider

# We can instantiate the provider based on environment variables
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    _provider = ResendEmailProvider(api_key=RESEND_API_KEY, from_email="noreply@alumniconn.com")
else:
    _provider = MockEmailProvider()

# Setup Jinja2 environment
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../templates/emails")
env = Environment(loader=FileSystemLoader(template_dir))

class EmailService:
    """
    Service responsible for rendering email templates and dispatching them to the configured provider.
    """
    
    @classmethod
    async def send_user_verification(cls, to_email: str, token: str, username: str) -> bool:
        """
        Sends the email verification link to a normal user.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        verification_link = f"{frontend_url}/verify-email?token={token}"
        
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
        verification_link = f"{frontend_url}/verify-college?token={token}"
        
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
        reset_link = f"{frontend_url}/{college_slug}/reset-password?token={token}"
        
        template = env.get_template("password_reset.html")
        html_body = template.render(username=username, reset_link=reset_link)
        
        return await _provider.send_email(
            to_email=to_email,
            subject="Reset your password",
            html_body=html_body
        )
