from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from src.services.auth_service import (
    login_super_admin,
    login_user,
    register_user,
    verify_user_email,
    resend_user_verification,
    forgot_password,
    reset_password
)
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

router = APIRouter()

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


@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    success = verify_user_email(db, request.token)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")
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
