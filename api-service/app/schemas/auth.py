from pydantic import BaseModel

from app.models.enums import UserRole
from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.citizen


class RegisterResponse(BaseModel):
    user: UserRead


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead