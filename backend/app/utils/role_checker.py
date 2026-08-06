from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.utils.security import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer()


import logging

logger = logging.getLogger("app.auth")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract and validate JWT token from Authorization header.
    Returns the current authenticated user.
    """
    token = credentials.credentials
    
    payload = decode_access_token(token)
    if not payload:
        logger.warning("Token decoding failed or token expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id_raw = payload.get("sub")
    if user_id_raw is None:
        logger.warning("Token payload does not contain 'sub' claim.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    try:
        user_id = int(user_id_raw)
    except (ValueError, TypeError):
        user_id = user_id_raw

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning(f"User with ID {user_id} (raw: {user_id_raw}) not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    if not user.is_active:
        logger.warning(f"User with ID {user_id} is inactive.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive"
        )
    
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_admin_or_clerk(current_user: User = Depends(get_current_user)) -> User:
    """Require admin or clerk role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.CLERK]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Clerk access required"
        )
    return current_user


def require_any_role(current_user: User = Depends(get_current_user)) -> User:
    """Any authenticated user"""
    return current_user
