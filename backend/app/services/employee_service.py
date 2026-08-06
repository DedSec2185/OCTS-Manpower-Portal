from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models import Employee, User, AuditLog, AuditAction
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeLimited
from app.utils import write_audit_log, serialize_model
from fastapi import HTTPException, status
from datetime import date
from typing import List, Tuple, Optional, Dict


def get_next_sr_no(db: Session) -> int:
    """Get the next serial number for a new employee"""
    max_sr_no = db.query(func.max(Employee.sr_no)).scalar()
    return (max_sr_no or 0) + 1


def create_employee(
    db: Session,
    data: EmployeeCreate,
    created_by_id: int
) -> Employee:
    """
    Create a new employee record.
    Auto-assigns Sr.No and writes CREATE audit log.
    """
    # Check for duplicate passport
    existing = db.query(Employee).filter(
        Employee.passport_number == data.passport_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Passport number already exists"
        )

    # Check for duplicate Aadhar (only if provided)
    if data.aadhar_number:
        existing_aadhar = db.query(Employee).filter(
            Employee.aadhar_number == data.aadhar_number
        ).first()
        
        if existing_aadhar:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Aadhar number already exists"
            )

    # Check for duplicate Phone
    existing_phone = db.query(Employee).filter(
        Employee.phone_number == data.phone_number
    ).first()
    
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already exists"
        )
    
    # Get next Sr.No
    sr_no = get_next_sr_no(db)
    
    # Create employee
    employee = Employee(
        sr_no=sr_no,
        **data.dict(exclude_unset=True),
        created_by_id=created_by_id
    )
    
    db.add(employee)
    db.flush()  # Get the ID before commit
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=created_by_id,
        action=AuditAction.CREATE,
        table_name="employees",
        record_id=employee.id,
        new_value=serialize_model(employee)
    )
    
    db.commit()
    db.refresh(employee)
    
    return employee


def get_all_employees(
    db: Session,
    page: int = 1,
    limit: int = 50,
    designation: Optional[str] = None,
    status: Optional[str] = None,
    bosiet: Optional[bool] = None,
    sort: str = "sr_no",
    order: str = "asc",
    project: Optional[str] = None
) -> Tuple[List[Employee], int]:
    """Get all employees with optional filters and pagination"""
    query = db.query(Employee)
    
    # Apply filters
    if designation:
        query = query.filter(Employee.designation.ilike(f"%{designation}%"))
    if status:
        query = query.filter(Employee.current_status == status)
    if bosiet is not None:
        query = query.filter(Employee.bosiet_done == bosiet)
    if project:
        query = query.filter(Employee.current_project == project)
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Employee, sort, Employee.sr_no)
    if order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    employees = query.offset((page - 1) * limit).limit(limit).all()
    
    return employees, total


def get_employee_by_id(db: Session, employee_id: int) -> Employee:
    """Get employee by ID"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee


def search_employees(
    db: Session,
    query_str: Optional[str] = None,
    field: Optional[str] = None,
    designation: Optional[str] = None,
    status: Optional[str] = None,
    project: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> Tuple[List[Employee], int]:
    """
    Search employees by various fields.
    If field is specified, search only that field.
    Otherwise search all searchable fields.
    """
    query = db.query(Employee)
    
    # Apply field-specific or global search if query_str is provided and not empty
    if query_str and query_str.strip():
        query_str = query_str.strip()
        if field:
            if field == "full_name":
                query = query.filter(Employee.full_name.ilike(f"%{query_str}%"))
            elif field == "passport_number":
                query = query.filter(Employee.passport_number.ilike(f"%{query_str}%"))
            elif field == "aadhar_number":
                query = query.filter(Employee.aadhar_number == query_str)
            elif field == "phone_number":
                query = query.filter(Employee.phone_number == query_str)
            elif field == "cdc_number":
                query = query.filter(Employee.cdc_number.ilike(f"%{query_str}%"))
            elif field == "designation":
                query = query.filter(Employee.designation.ilike(f"%{query_str}%"))
        else:
            # Search across all searchable fields
            query = query.filter(
                or_(
                    Employee.full_name.ilike(f"%{query_str}%"),
                    Employee.passport_number.ilike(f"%{query_str}%"),
                    Employee.aadhar_number == query_str,
                    Employee.phone_number == query_str,
                    Employee.cdc_number.ilike(f"%{query_str}%"),
                    Employee.designation.ilike(f"%{query_str}%"),
                )
            )
    
    # Apply additional filters
    if designation:
        query = query.filter(Employee.designation.ilike(f"%{designation}%"))
    if status:
        query = query.filter(Employee.current_status == status)
    if project:
        query = query.filter(Employee.current_project == project)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    employees = query.order_by(Employee.sr_no.asc()).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    return employees, total


def update_employee(
    db: Session,
    employee_id: int,
    data: EmployeeUpdate,
    updated_by_id: int
) -> Employee:
    """
    Update employee record.
    Captures old values, writes UPDATE audit log.
    Prevents duplicate passport number.
    """
    employee = get_employee_by_id(db, employee_id)
    
    # Check for duplicate passport if passport is being updated
    if data.passport_number and data.passport_number != employee.passport_number:
        existing = db.query(Employee).filter(
            and_(
                Employee.passport_number == data.passport_number,
                Employee.id != employee_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Passport number already exists"
            )

    # Check for duplicate Aadhar if Aadhar is being updated
    if data.aadhar_number and data.aadhar_number != employee.aadhar_number:
        existing = db.query(Employee).filter(
            and_(
                Employee.aadhar_number == data.aadhar_number,
                Employee.id != employee_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Aadhar number already exists"
            )

    # Check for duplicate Phone if Phone is being updated
    if data.phone_number and data.phone_number != employee.phone_number:
        existing = db.query(Employee).filter(
            and_(
                Employee.phone_number == data.phone_number,
                Employee.id != employee_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number already exists"
            )
    
    # Capture old values
    old_value = serialize_model(employee)
    
    # Update fields
    update_data = data.dict(exclude_unset=True)

    # Check for unauthorized salary update
    if "per_day_salary" in update_data:
        # Get role of the user updating this employee
        updating_user = db.query(User).filter(User.id == updated_by_id).first()
        # If user is clerk (or anything not admin) or not found, prevent salary change
        if not updating_user or updating_user.role.value != "admin":
            # If the value is actually changing from what's currently in the database
            current_salary = employee.per_day_salary
            new_salary = update_data["per_day_salary"]
            # Treat numeric precision comparison carefully
            if current_salary != new_salary:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Clerks and non-admin users are not authorized to update employee salary details."
                )

    for field, value in update_data.items():
        setattr(employee, field, value)
    
    employee.updated_by_id = updated_by_id
    
    db.add(employee)
    db.flush()
    
    # Capture new values
    new_value = serialize_model(employee)
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=updated_by_id,
        action=AuditAction.UPDATE,
        table_name="employees",
        record_id=employee.id,
        old_value=old_value,
        new_value=new_value
    )
    
    db.commit()
    db.refresh(employee)
    
    return employee


def delete_employee(
    db: Session,
    employee_id: int,
    deleted_by_id: int
) -> None:
    """
    Delete employee and all associated files.
    Writes DELETE audit log.
    """
    from app.services.file_service import delete_all_files
    
    employee = get_employee_by_id(db, employee_id)
    
    # Capture values before delete
    old_value = serialize_model(employee)
    
    # Delete all uploaded files
    delete_all_files(employee_id)
    
    # Delete from database
    db.delete(employee)
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=deleted_by_id,
        action=AuditAction.DELETE,
        table_name="employees",
        record_id=employee_id,
        old_value=old_value
    )
    
    db.commit()
