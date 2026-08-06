from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="user", pattern="^(admin|clerk|user)$")
    phone_number: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """User update schema"""
    role: Optional[str] = Field(None, pattern="^(admin|clerk|user)$")
    is_active: Optional[bool] = None


class UserOut(UserBase):
    """User output schema"""
    id: int
    is_active: bool
    is_email_verified: bool
    is_phone_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    """Profile update schema for users self-editing details"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)

