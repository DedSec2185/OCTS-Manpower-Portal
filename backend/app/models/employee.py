from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum, ForeignKey,
    Date, DECIMAL, Text, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class EmployeeStatus(str, enum.Enum):
    """Employee deployment status"""
    AVAILABLE = "available"
    ACTIVE = "active"
    SIGNED_OFF = "signed_off"
    CANCELLED = "cancelled"


class Employee(Base):
    """Employee model for manpower records"""
    __tablename__ = "employees"

    # Internal IDs
    id = Column(Integer, primary_key=True, index=True)
    sr_no = Column(Integer, unique=True, nullable=False, index=True)

    # Identity
    full_name = Column(String(150), nullable=False, index=True)
    designation = Column(String(100), index=True)
    father_name = Column(String(150))
    dob = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(100))
    religion = Column(String(50))
    marital_status = Column(String(30))
    languages_known = Column(Text)
    blood_group = Column(String(10))
    indos_number = Column(String(50))

    # Passport (Primary)
    passport_number = Column(String(50), unique=True, nullable=False, index=True)
    passport_issue_date = Column(Date)
    passport_expiry_date = Column(Date)
    passport_issue_place = Column(String(100))

    # CDC / NED Pass
    cdc_number = Column(String(50), index=True)
    cdc_validity = Column(Date)
    cdc_received_date = Column(Date)
    cdc_issue_place = Column(String(100))

    # Identity Documents
    aadhar_number = Column(String(20), unique=True, nullable=True, index=True)
    civil_id_number = Column(String(50))

    # Contact
    phone_number = Column(String(30), unique=True, nullable=False, index=True)
    phone_number_alt = Column(String(30))
    email = Column(String(150))
    permanent_address = Column(Text)
    pin_code = Column(String(20))

    # Safety Certifications
    bosiet_done = Column(Boolean, default=False)
    bosiet_issue_date = Column(Date)
    bosiet_expiry_date = Column(Date)
    bosiet_cert_number = Column(String(100))
    h2s_done = Column(Boolean, default=False)
    h2s_issue_date = Column(Date)
    h2s_expiry_date = Column(Date)
    stcw_done = Column(Boolean, default=False)
    stcw_issue_date = Column(Date)
    stcw_expiry_date = Column(Date)
    pdo_induction_done = Column(Boolean, default=False)
    medical_fitness_status = Column(String(20))
    medical_cert_expiry = Column(Date)

    # Police Clearance
    pcc_validity = Column(Date)

    # Deployment
    sign_on_date = Column(Date)
    sign_off_date = Column(Date)
    pass_cancellation_date = Column(Date)
    current_status = Column(
        Enum(EmployeeStatus),
        default=EmployeeStatus.AVAILABLE,
        nullable=False
    )

    # Documents Checklist
    photo_received = Column(Boolean, default=False)
    received_documents = Column(Text)
    remarks = Column(Text)

    # Family & Contacts
    mother_name = Column(String(150))
    emergency_contact_number = Column(String(30))

    # Bank Details
    bank_account_number = Column(String(50))
    bank_name = Column(String(150))
    bank_ifsc_code = Column(String(30))
    nominee_name = Column(String(150))
    nominee_number = Column(String(30))
    nominee_address = Column(Text)

    # Company Details
    joining_date = Column(Date)

    # PPE Details
    ppe_boiler_suit_size = Column(String(20))
    ppe_issue_date = Column(Date)
    ppe_shoe_size = Column(String(20))

    # Trade Certificate Details
    trade_certificate_status = Column(Boolean, default=False)
    trade_certificate_issue_date = Column(Date)
    trade_certificate_issue_place = Column(String(150))

    # Exit Details (Admin Only)
    exit_date = Column(Date)
    exit_remarks = Column(Text)
    
    # Project Details
    current_project = Column(String(100))

    # Professional & Financial
    total_experience_years = Column(DECIMAL(4, 1))
    experience_details = Column(Text)
    education = Column(Text)
    skills = Column(Text)
    per_day_salary = Column(String(100), nullable=True)

    # File Paths
    cv_pdf_path = Column(String(500))
    photo_file_path = Column(String(500))
    passport_copy_path = Column(String(500))
    cdc_copy_path = Column(String(500))
    bosiet_cert_path = Column(String(500))
    medical_cert_path = Column(String(500))
    other_docs_path = Column(String(500))
    
    # New File Paths
    aadhar_card_path = Column(String(500))
    pan_card_path = Column(String(500))
    insurance_path = Column(String(500))
    pass_cancellation_path = Column(String(500))
    trade_certificate_path = Column(String(500))
    ned_pass_copy_path = Column(String(500))
    pcc_certificate_path = Column(String(500))
    bank_details_path = Column(String(500))

    # Audit
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_by_id = Column(Integer, ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # Relationships
    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_employees"
    )
    updated_by = relationship(
        "User",
        foreign_keys=[updated_by_id],
        back_populates="updated_employees"
    )

    # Indexes
    __table_args__ = (
        Index("idx_full_name", "full_name"),
        Index("idx_passport_number", "passport_number"),
        Index("idx_aadhar_number", "aadhar_number"),
        Index("idx_phone_number", "phone_number"),
        Index("idx_cdc_number", "cdc_number"),
        Index("idx_designation", "designation"),
        Index("idx_sr_no", "sr_no"),
    )


class EmployeeDocument(Base):
    """Employee Document storage for persistent serverless uploads"""
    __tablename__ = "employee_documents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    doc_type = Column(String(50), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    file_data = Column(Text, nullable=False)  # Base64 encoded string
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

