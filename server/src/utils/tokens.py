import secrets
import hmac
import hashlib
import os

# For a production application, this should be set in environment variables.
# Fallback is used here only to prevent crashes if env is not set perfectly during dev.
TOKEN_SECRET_KEY = os.getenv("TOKEN_SECRET_KEY", "dev_secret_key_change_me_in_production").encode("utf-8")


def generate_verification_token() -> str:
    """
    Generates a cryptographically secure random token.
    32 bytes provides 256 bits of entropy.
    """
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """
    Generates a secure HMAC-SHA256 hash of the given token.
    """
    return hmac.new(
        key=TOKEN_SECRET_KEY,
        msg=token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()


def verify_token(raw_token: str, hashed_token: str) -> bool:
    """
    Verifies if a raw token matches a hashed token using timing-safe comparison.
    """
    if not raw_token or not hashed_token:
        return False
        
    expected_hash = hash_token(raw_token)
    return hmac.compare_digest(expected_hash, hashed_token)
