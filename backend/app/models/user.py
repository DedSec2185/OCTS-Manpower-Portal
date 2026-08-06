from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"
    CLERK = "clerk"
    USER = "user"


class User(Base):
    """User model for authentication and access control"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    phone_number = Column(String(20), nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # Relationships
    created_employees = relationship(
        "Employee",
        foreign_keys="Employee.created_by_id",
        back_populates="created_by"
    )
    updated_employees = relationship(
        "Employee",
        foreign_keys="Employee.updated_by_id",
        back_populates="updated_by"
    )
    audit_logs = relationship("AuditLog", back_populates="user")
