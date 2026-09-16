from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeLimited, EmployeeSearchResult
from app.services import (
    create_employee, get_all_employees, get_employee_by_id,
    search_employees, update_employee, delete_employee,
    save_file, get_file_download_response, get_file_column_name, delete_file
)
from app.utils import require_admin, require_admin_or_clerk, require_any_role, write_audit_log
from app.models import AuditAction
from typing import Optional, Union
from pathlib import Path
import os

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=EmployeeOut)
async def create_new_employee(
    employee_data: EmployeeCreate,
    current_user: User = Depends(require_admin_or_clerk),
    db: Session = Depends(get_db)
):
    """Create new employee record"""
    employee = create_employee(db, employee_data, current_user.id)
    
    # Convert to output schema with file status
    return enrich_employee_with_file_status(employee)


@router.get("", response_model=EmployeeSearchResult)
async def get_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    designation: Optional[str] = None,
    status: Optional[str] = None,
    bosiet: Optional[bool] = None,
    sort: str = "sr_no",
    order: str = "asc",
    project: Optional[str] = None,
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Get all employees with filters (viewers get limited fields)"""
    employees, total = get_all_employees(
        db, page, limit, designation, status, bosiet, sort, order, project
    )
    
    # Enrich with file status and filter based on user role
    if current_user.role.value == "user":
        items = [EmployeeLimited.from_orm(emp) for emp in employees]
    else:
        items = [enrich_employee_with_file_status(emp) for emp in employees]
    
    pages = (total + limit - 1) // limit
    return EmployeeSearchResult(items=items, total=total, page=page, limit=limit, pages=pages)


@router.get("/search", response_model=EmployeeSearchResult)
async def search_employees_endpoint(
    q: Optional[str] = Query(None),
    field: Optional[str] = None,
    designation: Optional[str] = None,
    status: Optional[str] = None,
    project: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Search employees (all roles, but user role gets limited fields)"""
    employees, total = search_employees(
        db, q, field, designation, status, project, page, limit
    )
    
    # Enrich with file status and apply role-based filtering
    if current_user.role.value == "user":
        items = [
            EmployeeLimited.from_orm(emp) for emp in employees
        ]
    else:
        items = [enrich_employee_with_file_status(emp) for emp in employees]
    
    pages = (total + limit - 1) // limit
    return EmployeeSearchResult(items=items, total=total, page=page, limit=limit, pages=pages)


@router.get("/{employee_id}", response_model=Union[EmployeeOut, EmployeeLimited])
async def get_employee(
    employee_id: int,
    current_user: User = Depends(require_any_role),
    db: Session = Depends(get_db)
):
    """Get employee details (viewers get limited fields)"""
    employee = get_employee_by_id(db, employee_id)
    if current_user.role.value == "user":
        return EmployeeLimited.from_orm(employee)
    return enrich_employee_with_file_status(employee)





@router.put("/{employee_id}", response_model=EmployeeOut)
async def update_employee_full(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update full employee record (admin only)"""
    employee = update_employee(db, employee_id, employee_data, current_user.id)
    return enrich_employee_with_file_status(employee)


@router.patch("/{employee_id}", response_model=EmployeeOut)
async def update_employee_partial(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update partial employee record (admin only)"""
    employee = update_employee(db, employee_id, employee_data, current_user.id)
    return enrich_employee_with_file_status(employee)


@router.delete("/{employee_id}")
async def delete_employee_record(
    employee_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete employee record (admin only)"""
    delete_employee(db, employee_id, current_user.id)
    return {"message": "Employee deleted successfully"}


@router.delete("/{employee_id}/upload/{doc_type}")
async def delete_document(
    employee_id: int,
    doc_type: str,
    current_user: User = Depends(require_admin_or_clerk),
    db: Session = Depends(get_db)
):
    """Delete uploaded document for an employee (admin and clerk)"""
    # Verify employee exists
    employee = get_employee_by_id(db, employee_id)
    
    # Check if doc exists
    column_name = get_file_column_name(doc_type)
    file_path = getattr(employee, column_name)
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {doc_type} document found for this employee"
        )
    
    # Delete file
    delete_file(employee_id, doc_type, file_path, db=db)
    
    # Update employee record
    setattr(employee, column_name, None)
    db.commit()
    
    # Audit log
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditAction.DELETE,
        target_type="employee_document",
        target_id=employee_id,
        details=f"Deleted {doc_type} document for employee {employee.full_name}"
    )
    
    return {"message": f"{doc_type} deleted successfully"}


@router.post("/{employee_id}/upload/{doc_type}")
async def upload_document(
    employee_id: int,
    doc_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin_or_clerk),
    db: Session = Depends(get_db)
):
    """Upload document for employee"""
    # Get employee first
    employee = get_employee_by_id(db, employee_id)
    
    # Save file to DB + filesystem
    file_path = await save_file(employee_id, doc_type, file, db=db)
    
    # Update employee record with file path
    column_name = get_file_column_name(doc_type)
    setattr(employee, column_name, file_path)
    
    db.commit()
    db.refresh(employee)
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditAction.FILE_UPLOAD,
        table_name="employees",
        record_id=employee_id,
        new_value={"doc_type": doc_type, "file_path": file_path}
    )
    
    return {
        "message": f"{doc_type} uploaded successfully",
        "file_path": file_path
    }


@router.get("/{employee_id}/download/{doc_type}")
async def download_document(
    employee_id: int,
    doc_type: str,
    current_user: User = Depends(require_admin_or_clerk),
    db: Session = Depends(get_db)
):
    """Download document for employee"""
    # Get employee
    employee = get_employee_by_id(db, employee_id)
    
    # Get file path from employee record
    column_name = get_file_column_name(doc_type)
    file_path = getattr(employee, column_name, None)
    
    # Write audit log
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action=AuditAction.FILE_DOWNLOAD,
        table_name="employees",
        record_id=employee_id,
        new_value={"doc_type": doc_type}
    )
    
    # Return file response (from DB or local file)
    return get_file_download_response(employee_id, doc_type, file_path, db=db)



def enrich_employee_with_file_status(employee) -> EmployeeOut:
    """Add file status flags to employee"""
    employee_dict = {col.name: getattr(employee, col.name) for col in employee.__table__.columns}
    
    # Add file status flags
    employee_dict["has_cv"] = bool(employee.cv_pdf_path)
    employee_dict["has_passport_copy"] = bool(employee.passport_copy_path)
    employee_dict["has_ned_pass_copy"] = bool(employee.ned_pass_copy_path)
    employee_dict["has_aadhar_card"] = bool(employee.aadhar_card_path)
    employee_dict["has_pan_card"] = bool(employee.pan_card_path)
    employee_dict["has_insurance"] = bool(employee.insurance_path)
    employee_dict["has_pass_cancellation"] = bool(employee.pass_cancellation_path)
    employee_dict["has_trade_cert"] = bool(employee.trade_certificate_path)
    employee_dict["has_bosiet_cert"] = bool(employee.bosiet_cert_path)
    employee_dict["has_medical_cert"] = bool(employee.medical_cert_path)
    employee_dict["has_pcc_certificate"] = bool(employee.pcc_certificate_path)
    employee_dict["has_photo"] = bool(employee.photo_file_path)
    employee_dict["has_other_docs"] = bool(employee.other_docs_path)
    employee_dict["has_bank_details"] = bool(getattr(employee, "bank_details_path", None))
    
    return EmployeeOut(**employee_dict)
