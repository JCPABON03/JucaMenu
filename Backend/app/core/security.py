from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError

import logging
# `passlib.handlers.bcrypt` may emit a warning when the installed bcrypt
# package is broken; since we've observed that behavior and are dropping
# passlib for password hashing anyway, silence it preemptively.
logging.getLogger("passlib.handlers.bcrypt").setLevel(logging.ERROR)

# We'll use the underlying `bcrypt` library directly instead of
# passlib.CryptContext, which avoids the buggy backend detection that was
# causing failures for every password.
import bcrypt

import os

# Secret key for JWT. In production, set this via environment variable and keep it secret.
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))  # default 1 day



def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if `plain_password` matches the given bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        # any failure should simply return False rather than crash
        return False


def _hash_with_bcrypt(password: bytes) -> bytes:
    # bcrypt.hashpw requires bytes and returns bytes
    # gensalt() uses a cost of 12 by default (configurable via env if needed)
    return bcrypt.hashpw(password, bcrypt.gensalt())


from fastapi import HTTPException


def get_password_hash(password: str) -> str:
    # enforce bcrypt's 72-byte limit on raw UTF-8 bytes
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long; maximum is 72 bytes (bcrypt limitation)",
        )
    try:
        hashed_bytes = _hash_with_bcrypt(pw_bytes)
        # store as utf-8 string for JSON compatibility
        return hashed_bytes.decode("utf-8")
    except Exception as exc:
        # log details so we can debug if something unusual occurs
        logging.exception("password hashing error")
        raise HTTPException(status_code=500, detail="password hashing failed")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
