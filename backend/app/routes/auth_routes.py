from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import LoginRequest, TokenResponse, RegisterRequest, ChangePasswordRequest, UserOut, ProfileUpdate
from app.services import login as auth_login, get_user_by_id, change_password
from app.utils import require_admin, require_any_role, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])

from fastapi import Request
from app.utils.rate_limit import limiter

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    login_req: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login"""
    return auth_login(db, login_req.username, login_req.password)


@router.get("/me", response_model=UserOut)
async def get_current_user_info(
    current_user: User = Depends(require_any_role)
):
    """Get current logged-in user info"""
    return current_user


@router.post("/register", response_model=UserOut)
async def register(
    request: RegisterRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Register new user (admin only)"""
    # Check if username exists
    existing = db.query(User).filter(User.username == request.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == request.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )
    
    # Create new user
    new_user = User(
        name=request.name,
        email=request.email,
        username=request.username,
        password_hash=hash_password(request.password),
        role=UserRole(request.role)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.patch("/change-password")
async def change_password_endpoint(
    request: ChangePasswordRequest,
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Change user password"""
    updated_user = change_password(
        db, current_user, request.current_password, request.new_password
    )
    return {"message": "Password changed successfully"}


@router.put("/profile", response_model=UserOut)
async def update_profile(
    request: ProfileUpdate,
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Update current user profile info"""
    if request.username and request.username != current_user.username:
        existing = db.query(User).filter(User.username == request.username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        current_user.username = request.username

    if request.email and request.email != current_user.email:
        existing = db.query(User).filter(User.email == request.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        current_user.email = request.email

    if request.name:
        current_user.name = request.name
    if request.phone_number is not None:
        current_user.phone_number = request.phone_number

    db.commit()
    db.refresh(current_user)
    return current_user
