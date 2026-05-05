from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt
from datetime import datetime, timedelta
from enum import Enum
import hashlib
import secrets

from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24))

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("CRITICAL: SECRET_KEY or ALGORITHM missing from .env file!")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (TypeError, ValueError, UnknownHashError):
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    role = to_encode.get("role")
    if role is None:
        raise ValueError("Access token payload must include a role claim")
    if isinstance(role, Enum):
        to_encode["role"] = role.value
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        return None


def generate_activation_token() -> str:
    return secrets.token_urlsafe(48)


def hash_activation_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
