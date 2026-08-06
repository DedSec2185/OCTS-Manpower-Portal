from sqlalchemy.orm import Session
from app.models import AuditLog, AuditAction
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import json


def write_audit_log(
    db: Session,
    user_id: int,
    action: AuditAction,
    table_name: str,
    record_id: Optional[int] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Write an audit log entry to the database.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: Type of action (CREATE, UPDATE, DELETE, etc.)
        table_name: Name of the table affected
        record_id: ID of the record affected
        old_value: Previous values (for UPDATE/DELETE)
        new_value: New values (for CREATE/UPDATE)
        ip_address: IP address of the request
    
    Returns:
        Created AuditLog instance
    """
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        created_at=datetime.utcnow()
    )
    
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    
    return audit_log


def serialize_model(obj) -> Dict:
    """Convert SQLAlchemy model to dictionary for audit logging"""
    result = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        
        # Convert dates and datetimes to ISO format strings
        if hasattr(value, 'isoformat'):
            value = value.isoformat()
        # Handle enums
        elif hasattr(value, 'value'):
            value = value.value
        # Handle Decimals
        elif isinstance(value, Decimal):
            value = float(value)
        
        # Safe-guard check: try serialization or convert to string representation
        if value is not None:
            try:
                json.dumps(value)
            except (TypeError, OverflowError):
                value = str(value)
        
        result[column.name] = value
    
    return result


