from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


from app.schemas.user_schema import UserOut


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)


class TokenResponse(BaseModel):
    """JWT token response schema"""
    access_token: str
    token_type: str
    user: UserOut


class RegisterRequest(BaseModel):
    """User registration schema"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(default="user", pattern="^(admin|clerk|user)$")


class ChangePasswordRequest(BaseModel):
    """Change password schema"""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
