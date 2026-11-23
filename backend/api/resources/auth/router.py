from fastapi import APIRouter, HTTPException
from sqlmodel import select

from backend.api.core.deps import SessionDep
from backend.api.resources.auth.deps import CurrentUser
from backend.api.resources.auth.models import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
    User,
    UserPublic,
    UserUpdate,
)
from backend.api.resources.auth.security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _public(user: User) -> UserPublic:
    return UserPublic.model_validate(user, from_attributes=True)


def _token(user: User) -> TokenResponse:
    return TokenResponse(access_token=create_token(user.id), user=_public(user))


@router.post("/login")
def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    user = session.exec(select(User).where(User.email == body.email.lower())).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return _token(user)


@router.post("/signup", status_code=201)
def signup(body: SignupRequest, session: SessionDep) -> TokenResponse:
    email = body.email.lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(409, "Email already registered")
    user = User(email=email, name=body.name, role="user", password_hash=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return _token(user)


@router.get("/me")
def me(user: CurrentUser) -> UserPublic:
    return _public(user)


@router.patch("/me")
def update_me(body: UserUpdate, user: CurrentUser, session: SessionDep) -> UserPublic:
    for key, value in body.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return _public(user)
