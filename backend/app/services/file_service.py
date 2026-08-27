import os
import shutil
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from app.config import settings
from typing import Optional, Dict
from datetime import datetime


# Document type configurations
ALLOWED_DOC_TYPES = {
    "cv": {
        "path": "cv",
        "allowed_ext": [".pdf"],
        "column": "cv_pdf_path"
    },
    "passport_copy": {
        "path": "passports",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "passport_copy_path"
    },
    "ned_pass_copy": {
        "path": "ned",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "ned_pass_copy_path"
    },
    "aadhar_card": {
        "path": "aadhar",
        "allowed_ext": [".pdf"],
        "column": "aadhar_card_path"
    },
    "pan_card": {
        "path": "pan",
        "allowed_ext": [".pdf"],
        "column": "pan_card_path"
    },
    "insurance": {
        "path": "insurance",
        "allowed_ext": [".pdf"],
        "column": "insurance_path"
    },
    "pass_cancellation": {
        "path": "cancellation",
        "allowed_ext": [".pdf"],
        "column": "pass_cancellation_path"
    },
    "trade_cert": {
        "path": "trade",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "trade_certificate_path"
    },
    "bosiet_cert": {
        "path": "bosiet",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "bosiet_cert_path"
    },
    "medical_cert": {
        "path": "medical",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "medical_cert_path"
    },
    "pcc_certificate": {
        "path": "pcc",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png"],
        "column": "pcc_certificate_path"
    },
    "other_docs": {
        "path": "others",
        "allowed_ext": [".pdf", ".jpg", ".jpeg", ".png", ".zip"],
        "column": "other_docs_path"
    }
}


def validate_file(file: UploadFile, doc_type: str) -> None:
    """Validate file size and extension"""
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type: {doc_type}"
        )
    
    # Get file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = ALLOWED_DOC_TYPES[doc_type]["allowed_ext"]
    
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_exts)}"
        )


import base64
from io import BytesIO
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from app.models import EmployeeDocument


async def save_file(employee_id: int, doc_type: str, file: UploadFile, db: Optional[Session] = None) -> str:
    """
    Save uploaded file to Database (for serverless Vercel) and optional local filesystem.
    """
    validate_file(file, doc_type)
    
    # Read file contents
    await file.seek(0)
    content = await file.read()
    
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{doc_type}{file_ext}"
    relative_path = f"{employee_id}/{filename}"
    
    # Save to Database if session provided
    if db is not None:
        try:
            base64_data = base64.b64encode(content).decode('utf-8')
            content_type = file.content_type or "application/octet-stream"
            
            # Check existing doc
            existing_doc = db.query(EmployeeDocument).filter(
                EmployeeDocument.employee_id == employee_id,
                EmployeeDocument.doc_type == doc_type
            ).first()
            
            if existing_doc:
                existing_doc.filename = filename
                existing_doc.content_type = content_type
                existing_doc.file_data = base64_data
                existing_doc.created_at = datetime.utcnow()
            else:
                new_doc = EmployeeDocument(
                    employee_id=employee_id,
                    doc_type=doc_type,
                    filename=filename,
                    content_type=content_type,
                    file_data=base64_data
                )
                db.add(new_doc)
            db.commit()
        except Exception as e:
            print(f"Warning: Could not save document to DB: {e}")
            if db:
                db.rollback()

    # Try saving to local filesystem if directory is writable
    try:
        upload_dir = Path(settings.UPLOAD_DIR) / str(employee_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / filename
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        print(f"Notice: Local filesystem save skipped/read-only: {e}")
    
    return relative_path


def get_file_download_response(employee_id: int, doc_type: str, file_path: Optional[str], db: Optional[Session] = None):
    """
    Get file Response object from Database or local filesystem.
    """
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {doc_type} file found for this employee"
        )

    # 1. Try fetching from Database first
    if db is not None:
        try:
            doc = db.query(EmployeeDocument).filter(
                EmployeeDocument.employee_id == employee_id,
                EmployeeDocument.doc_type == doc_type
            ).first()
            if doc and doc.file_data:
                file_bytes = base64.b64decode(doc.file_data)
                return Response(
                    content=file_bytes,
                    media_type=doc.content_type,
                    headers={
                        "Content-Disposition": f'attachment; filename="{doc.filename}"'
                    }
                )
        except Exception as e:
            print(f"Warning: Failed retrieving doc from DB: {e}")

    # 2. Fallback to local filesystem
    full_path = Path(settings.UPLOAD_DIR) / file_path
    if full_path.exists():
        filename = os.path.basename(str(full_path))
        return FileResponse(
            str(full_path),
            filename=filename,
            media_type="application/octet-stream"
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"File not found: {file_path}"
    )


def get_file_path(employee_id: int, doc_type: str, file_path: Optional[str]) -> str:
    """Get absolute file path for backward compatibility"""
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {doc_type} file found for this employee"
        )
    
    full_path = Path(settings.UPLOAD_DIR) / file_path
    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found: {file_path}"
        )
    return str(full_path)


def delete_file(employee_id: int, doc_type: str, file_path: Optional[str], db: Optional[Session] = None) -> None:
    """Delete a specific document for an employee"""
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid document type: {doc_type}")
    
    # 1. Delete from DB
    if db is not None:
        try:
            db.query(EmployeeDocument).filter(
                EmployeeDocument.employee_id == employee_id,
                EmployeeDocument.doc_type == doc_type
            ).delete()
            db.commit()
        except Exception as e:
            print(f"Warning: Failed deleting doc from DB: {e}")
            db.rollback()
            
    # 2. Delete from filesystem
    if file_path:
        full_path = Path(settings.UPLOAD_DIR) / file_path
        if full_path.exists():
            try:
                os.remove(full_path)
            except Exception as e:
                print(f"Notice: Could not delete local file: {e}")


def delete_all_files(employee_id: int) -> None:
    """Delete all uploaded files for an employee"""
    try:
        employee_dir = Path(settings.UPLOAD_DIR) / str(employee_id)
        if employee_dir.exists():
            shutil.rmtree(employee_dir)
    except Exception as e:
        print(f"Notice: Could not delete local folder: {e}")


def get_file_column_name(doc_type: str) -> str:
    """Get the database column name for a document type"""
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type: {doc_type}"
        )
    return ALLOWED_DOC_TYPES[doc_type]["column"]

