"""Authentication utilities for Rate Card Pro."""
import time
import os
import jwt
from passlib.hash import bcrypt

SECRET = os.environ.get("RC_JWT_SECRET", "dev-secret-change-in-production")
ALG = "HS256"
TTL = 3600 * 8  # 8 hours

def hash_pw(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hash(password)

def verify_pw(password: str, password_hash: str) -> bool:
    """Verify a password against a hash."""
    return bcrypt.verify(password, password_hash)

def issue_jwt(email: str, role: str) -> str:
    """Issue a JWT token for a user."""
    now = int(time.time())
    payload = {
        "sub": email,
        "role": role,
        "iat": now,
        "exp": now + TTL
    }
    return jwt.encode(payload, SECRET, algorithm=ALG)

def decode_jwt(jwt_token: str) -> dict:
    """Decode and verify a JWT token."""
    return jwt.decode(jwt_token, SECRET, algorithms=[ALG])
