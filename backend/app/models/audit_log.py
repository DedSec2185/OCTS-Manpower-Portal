from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class AuditAction(str, enum.Enum):
    """Audit action types"""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    EXPORT = "EXPORT"
    FILE_UPLOAD = "FILE_UPLOAD"
    FILE_DOWNLOAD = "FILE_DOWNLOAD"


class AuditLog(Base):
    """Audit log for tracking all system changes"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(AuditAction), nullable=False)
    table_name = Column(String(100), nullable=False)
    record_id = Column(Integer)
    old_value = Column(JSON)
    new_value = Column(JSON)
    ip_address = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
