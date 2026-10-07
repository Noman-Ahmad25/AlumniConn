from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.services.auth_service import (
    login_super_admin,
    login_user,
    register_user,
    verify_user_email,
    resend_user_verification,
    forgot_password,
    reset_password,
    _token_for_user,
)
from src.models.user import User, UserRole
from src.schemas.admin_management import DemoLoginRequest
from src.schemas.user import (
    SuperAdminLogin,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from src.database.session import get_db
from src.utils.dispatcher import AbstractTaskDispatcher, get_task_dispatcher

from src.services.email.service import EMAIL_MODE
from src.services.email.demo_store import demo_email_store

router = APIRouter()

@router.get("/email-mode")
def get_email_mode():
    """Returns the current email mode ('demo' or 'real')."""
    return {"email_mode": EMAIL_MODE}


@router.get("/demo-emails")
def get_demo_emails(to_email: str | None = None, limit: int = 20):
    """Retrieve intercepted demo emails (available in demo mode)."""
    emails = demo_email_store.get_emails(to_email=to_email, limit=limit)
    return {"emails": [e.to_dict() for e in emails], "total": len(emails)}


@router.delete("/demo-emails")
def clear_demo_emails():
    """Clear intercepted demo emails."""
    demo_email_store.clear()
    return {"message": "Demo email inbox cleared"}

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    user_id: int


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user: UserCreate, 
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher)
):
    result = register_user(db, user, task_dispatcher)
    if result == "college_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="College not found")
    elif result == "email_exists":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    elif result == "username_exists":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    elif result == "db_error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    elif not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")
    return result





@router.get("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    success = verify_user_email(db, token)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    return {"message": "Email verified successfully"}


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher)
):
    resend_user_verification(db, request.user_id, task_dispatcher)
    return {"message": "If the account exists and is unverified, a new verification link has been sent."}


@router.post("/login", response_model=TokenResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Main login endpoint — accepts JSON with username_or_email, password, college_slug."""
    token = login_user(db, user_credentials)
    if token == "email_not_verified":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before logging in")
    if token == "college_not_approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="College not approved")
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if token == "super_admin_login_required":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use super admin login")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def handle_forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    task_dispatcher: AbstractTaskDispatcher = Depends(get_task_dispatcher)
):
    forgot_password(db, request, task_dispatcher)
    return {"message": "If the account exists, a password reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def handle_reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    success = reset_password(db, request)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    return {"message": "Password reset successfully"}


@router.post("/super-admin/login", response_model=TokenResponse)
def super_admin_login(user_credentials: SuperAdminLogin, db: Session = Depends(get_db)):
    token = login_super_admin(db, user_credentials)
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
def token_for_swagger(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Swagger UI 'Authorize' button endpoint.
    Enter college_slug in the 'client_id' field in the Authorize dialog.
    """

    college_slug = user.client_id
    if not college_slug:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Enter your college_slug in the 'client_id' field"
        )

    user_credentials = UserLogin(username_or_email=user.username, password=user.password, college_slug=college_slug)
    token = login_user(db, user_credentials)
    if token == "email_not_verified":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before logging in")
    if token == "college_not_approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="College not approved")
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if token == "super_admin_login_required":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use super admin login")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(request: DemoLoginRequest, db: Session = Depends(get_db)):
    role = request.demo_role.lower()
    user = None
    if role == "super_admin":
        user = db.query(User).filter(User.username == "demo_superadmin", User.is_active == True).first()
        if not user:
            user = db.query(User).filter(User.role == UserRole.SUPER_ADMIN, User.is_active == True).first()
    elif role == "college_admin":
        user = db.query(User).filter(User.username == "admin_nitk", User.is_active == True).first()
        if not user:
            user = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).first()
    elif role == "alumni":
        user = db.query(User).filter(User.username == "demo_alumni", User.is_active == True).first()
        if not user:
            user = db.query(User).filter(User.role == UserRole.ALUMNI, User.is_active == True).first()
    elif role == "student":
        user = db.query(User).filter(User.username == "demo_student", User.is_active == True).first()
        if not user:
            user = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active == True).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid demo role. Choose: super_admin, college_admin, alumni, student",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active demo account found for role '{role}'",
        )

    token = _token_for_user(user)
    college_slug = user.college.slug if user.college else None
    return {
        "access_token": token,
        "token_type": "bearer",
        "college_slug": college_slug,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
    }



