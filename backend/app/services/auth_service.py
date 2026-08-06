from sqlalchemy.orm import Session
from app.models import User, UserRole
from app.utils import hash_password, verify_password, create_access_token
from app.schemas import LoginRequest, TokenResponse, UserOut
from fastapi import HTTPException, status
from datetime import timedelta


def login(db: Session, username: str, password: str) -> TokenResponse:
    """
    Authenticate user and return JWT token.
    
    Raises:
        HTTPException: 401 if credentials invalid or user inactive
    """
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    user_out = UserOut.from_orm(user)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_out
    )


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> User:
    """Change user password"""
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    
    return user
