from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
from app.database import get_db
from app.models import User, UserRole, Employee, AuditLog, AuditAction
from app.schemas import UserCreate, UserUpdate, UserOut
from app.services import get_all_employees, export_to_excel
from app.utils import require_admin, require_any_role, hash_password, write_audit_log
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    from app.models import EmployeeStatus
    
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    active_deployments = db.query(func.count(Employee.id)).filter(
        Employee.current_status == EmployeeStatus.ACTIVE
    ).scalar() or 0
    available_workers = db.query(func.count(Employee.id)).filter(
        Employee.current_status == EmployeeStatus.AVAILABLE
    ).scalar() or 0
    
    # Employees added this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_entries = db.query(func.count(Employee.id)).filter(
        Employee.created_at >= week_ago
    ).scalar() or 0
    
    # Expiring certifications
    today = datetime.utcnow().date()
    thirty_days = today + timedelta(days=30)
    sixty_days = today + timedelta(days=60)
    
    expiring_pcc = db.query(func.count(Employee.id)).filter(
        and_(Employee.pcc_validity > today, Employee.pcc_validity <= thirty_days)
    ).scalar() or 0
    
    expiring_bosiet = db.query(func.count(Employee.id)).filter(
        and_(Employee.bosiet_expiry_date > today, Employee.bosiet_expiry_date <= sixty_days)
    ).scalar() or 0
    
    expiring_medical = db.query(func.count(Employee.id)).filter(
        and_(Employee.medical_cert_expiry > today, Employee.medical_cert_expiry <= sixty_days)
    ).scalar() or 0
    
    # Designations breakdown
    designations = db.query(
        Employee.designation,
        func.count(Employee.id).label("count")
    ).filter(Employee.designation.isnot(None)).group_by(
        Employee.designation
    ).all()
    
    designations_breakdown = [
        {"designation": d[0], "count": d[1]} for d in designations
    ]
    
    # Recent audit logs
    recent_logs = db.query(AuditLog).order_by(
        desc(AuditLog.created_at)
    ).limit(5).all()
    
    return {
        "total_employees": total_employees,
        "active_deployments": active_deployments,
        "available_workers": available_workers,
        "recent_entries_this_week": recent_entries,
        "expiring_pcc_count": expiring_pcc,
        "expiring_bosiet_count": expiring_bosiet,
        "expiring_medical_count": expiring_medical,
        "designations_breakdown": designations_breakdown,
        "recent_activity": [
            {
                "id": log.id,
                "action": log.action.value,
                "table_name": log.table_name,
                "record_id": log.record_id,
                "user_id": log.user_id,
                "created_at": log.created_at
            }
            for log in recent_logs
        ]
    }


@router.get("/employees/export-excel")
async def export_employees_excel(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Export all employees to Excel"""
    # Get all employees
    employees, _ = get_all_employees(db, page=1, limit=999999)
    
    # Generate Excel
    excel_file = export_to_excel(employees)
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditAction.EXPORT,
        table_name="employees",
        new_value={"exported_count": len(employees)}
    )
    
    return StreamingResponse(
        iter([excel_file.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=OCTS_MANPOWER_export.xlsx"}
    )


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    record_id: Optional[int] = None,
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Get audit logs with filters"""
    query = db.query(AuditLog)
    
    # Apply filters
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if date_from:
        query = query.filter(AuditLog.created_at >= date_from)
    if date_to:
        query = query.filter(AuditLog.created_at <= date_to)
    if record_id:
        query = query.filter(AuditLog.record_id == record_id)
    
    total = query.count()
    
    logs = query.order_by(desc(AuditLog.created_at)).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "user_name": log.user.name if log.user else f"User ID: {log.user_id}",
                "action": log.action.value,
                "table_name": log.table_name,
                "record_id": log.record_id,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "ip_address": log.ip_address,
                "created_at": log.created_at
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }


@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all system users"""
    total = db.query(func.count(User.id)).scalar() or 0
    
    users = db.query(User).order_by(User.created_at.desc()).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    pages = (total + limit - 1) // limit
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }


@router.post("/users", response_model=UserOut)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new user account"""
    # Check if username exists
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        role=UserRole(user_data.role)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_data.role:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Soft delete user (set inactive)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deleted successfully"}
