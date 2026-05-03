import os
import smtplib
from email.message import EmailMessage


def get_frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def build_activation_link(token: str) -> str:
    return f"{get_frontend_url()}/activate?token={token}"


def send_admin_credentials_email(to_email: str, college_name: str, email: str, password: str) -> None:
    """Send admin credentials email after college approval."""
    subject = f"{college_name} has been approved on AlumniConn!"
    body = (
        f"Congratulations! Your college, {college_name}, has been approved to join AlumniConn.\n\n"
        f"Your admin account has been created and is ready to use.\n\n"
        f"Login Credentials:\n"
        f"Email: {email}\n"
        f"Temporary Password: {password}\n\n"
        f"You can login at: {get_frontend_url()}/super-admin/login\n\n"
        f"We recommend changing your password after your first login.\n\n"
        f"Once logged in, you'll be able to:\n"
        f"- Manage your college's profile\n"
        f"- Create additional admin accounts\n"
        f"- Monitor student and alumni connections\n\n"
        f"If you did not expect this or have any questions, please contact our support team.\n"
    )

    smtp_host = os.getenv("SMTP_HOST")
    from_email = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "no-reply@alumniconn.local"))

    if not smtp_host:
        print(f"[college approval] Email to {to_email}: Email={email}, Password={password}")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(body)

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
        if use_tls:
            smtp.starttls()
        if smtp_user and smtp_password:
            smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)


def send_admin_activation_email(to_email: str, college_name: str, token: str) -> None:
    activation_link = build_activation_link(token)
    subject = f"{college_name} has been approved on AlumniConn!"
    body = (
        f"Congratulations! Your college, {college_name}, has been approved to join AlumniConn.\n\n"
        f"To complete your setup, please activate your admin account and create your password by visiting the link below:\n\n"
        f"{activation_link}\n\n"
        f"This activation link will expire in 48 hours and can only be used once.\n\n"
        f"Once activated, you'll be able to:\n"
        f"- Manage your college's profile\n"
        f"- Create additional admin accounts\n"
        f"- Monitor student and alumni connections\n\n"
        f"If you did not request this or have any questions, please contact our support team.\n"
    )

    smtp_host = os.getenv("SMTP_HOST")
    from_email = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "no-reply@alumniconn.local"))

    if not smtp_host:
        print(f"[college approval] Email to {to_email}: {activation_link}")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(body)

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
        if use_tls:
            smtp.starttls()
        if smtp_user and smtp_password:
            smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)


def send_college_rejection_email(to_email: str, college_name: str, reason: str | None = None) -> None:
    subject = f"{college_name} college request - Further information needed"
    reason_text = f"Reason: {reason}" if reason else "Please contact our support team for more details."
    body = (
        f"Thank you for your interest in joining AlumniConn with {college_name}.\n\n"
        f"We have reviewed your request and are unable to approve it at this time.\n\n"
        f"{reason_text}\n\n"
        f"If you have questions or would like to resubmit your request, please contact our support team.\n"
    )

    smtp_host = os.getenv("SMTP_HOST")
    from_email = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "no-reply@alumniconn.local"))

    if not smtp_host:
        print(f"[college rejection] Email to {to_email}: {reason_text}")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(body)

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
        if use_tls:
            smtp.starttls()
        if smtp_user and smtp_password:
            smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)
