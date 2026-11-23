"""Password hashing and JWT helpers."""
from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from backend.api.core.settings import settings

ALGORITHM = "HS256"
TOKEN_TTL = timedelta(days=7)

_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _hasher.verify(password, password_hash)


def create_token(user_id: int) -> str:
    if not settings.secret_key:
        raise RuntimeError("SECRET_KEY is empty: run `make setup`")
    payload = {"sub": str(user_id), "exp": datetime.now(UTC) + TOKEN_TTL}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str) -> int | None:
    """Return the user id, or None if the token is invalid or expired."""
    if not settings.secret_key:
        return None
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
