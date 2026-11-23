from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.api.core.deps import SessionDep
from backend.api.core.features import enabled
from backend.api.resources.auth.models import User
from backend.api.resources.auth.security import decode_token

_bearer = HTTPBearer(auto_error=False)
_Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]


def current_user_optional(session: SessionDep, creds: _Credentials) -> User | None:
    if creds is None:
        return None
    user_id = decode_token(creds.credentials)
    return session.get(User, user_id) if user_id is not None else None


def current_user(user: Annotated[User | None, Depends(current_user_optional)]) -> User:
    if user is None:
        raise HTTPException(401, "Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    return user


def login_if_auth_on(optional: Annotated[User | None, Depends(current_user_optional)]) -> User | None:
    """Login required when Feature `auth` is on; anonymous (None) otherwise."""
    return current_user(optional) if enabled("auth") else optional


def require_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Admin only")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
OptionalUser = Annotated[User | None, Depends(current_user_optional)]
AdminUser = Annotated[User, Depends(require_admin)]
