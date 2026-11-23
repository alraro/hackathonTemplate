from enum import Enum

from sqlalchemy import JSON, Column, String
from sqlmodel import Field, SQLModel

class Role(str, Enum):
    admin = "admin"
    user = "user"


class User(SQLModel, table=True):
    # Also the seed Read schema (no `Read` alias): seed.json carries `password_hash`.
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    role: Role = Field(default=Role.user, sa_column=Column(String, nullable=False))
    password_hash: str
    preferences: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))


class UserPublic(SQLModel):
    id: int
    email: str
    name: str
    role: Role
    preferences: dict = {}


class LoginRequest(SQLModel):
    email: str
    password: str


class SignupRequest(SQLModel):
    email: str
    password: str
    name: str


class UserUpdate(SQLModel):
    name: str | None = None
    preferences: dict | None = None


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
