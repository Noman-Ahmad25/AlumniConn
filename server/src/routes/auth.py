from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.services.auth_service import (
    activate_user,
    login_super_admin,
    login_user,
    register_user,
    verify_activation_token,
)
from src.schemas.user import (
    ActivationRequest,
    ActivationVerifyResponse,
    SuperAdminLogin,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from src.database.session import get_db

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    result = register_user(db, user)
    if result == "email_exists":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    elif result == "username_exists":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    elif result == "db_error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    elif not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")
    return result


@router.post("/login", response_model=TokenResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Main login endpoint — accepts JSON with email, password, college_id."""
    token = login_user(db, user_credentials)
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if token == "super_admin_login_required":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use super admin login")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/super-admin/login", response_model=TokenResponse)
def super_admin_login(user_credentials: SuperAdminLogin, db: Session = Depends(get_db)):
    token = login_super_admin(db, user_credentials)
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.get("/activate/verify", response_model=ActivationVerifyResponse)
def verify_activation(token: str, db: Session = Depends(get_db)):
    result = verify_activation_token(db, token)
    if result == "expired":
        return {"valid": False, "detail": "Activation link has expired"}
    if result != "valid":
        return {"valid": False, "detail": "Activation link is invalid"}
    return {"valid": True, "detail": "Activation link is valid"}


@router.post("/activate", response_model=UserResponse)
def activate_account(payload: ActivationRequest, db: Session = Depends(get_db)):
    result = activate_user(db, payload)
    if result == "expired":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activation link has expired")
    if result == "invalid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activation link is invalid")
    return result


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
def token_for_swagger(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Swagger UI 'Authorize' button endpoint.
    Enter college_id in the 'client_id' field in the Authorize dialog.
    """
    try:
        college_id = int(user.client_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Enter your college_id in the 'client_id' field"
        )

    user_credentials = UserLogin(email=user.username, password=user.password, college_id=college_id)
    token = login_user(db, user_credentials)
    if token == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    if token == "super_admin_login_required":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use super admin login")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}
