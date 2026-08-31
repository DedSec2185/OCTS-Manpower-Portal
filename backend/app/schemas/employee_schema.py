from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class EmployeeBase(BaseModel):
    """Base employee schema"""
    # Identity
    full_name: str = Field(..., min_length=2, max_length=150)
    designation: str = Field(..., min_length=2, max_length=100)
    father_name: Optional[str] = Field(None, max_length=150)
    dob: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    languages_known: Optional[str] = None
    blood_group: Optional[str] = None
    indos_number: Optional[str] = None

    # Passport
    passport_number: str = Field(..., min_length=5, max_length=50)
    passport_issue_date: Optional[date] = None
    passport_expiry_date: Optional[date] = None
    passport_issue_place: Optional[str] = None

    # CDC
    cdc_number: Optional[str] = None
    cdc_validity: Optional[date] = None
    cdc_received_date: Optional[date] = None
    cdc_issue_place: Optional[str] = None

    # Identity Documents
    aadhar_number: Optional[str] = Field(None, max_length=12)
    civil_id_number: Optional[str] = None

    # Contact
    phone_number: str = Field(..., min_length=5, max_length=30)
    phone_number_alt: Optional[str] = None
    email: Optional[EmailStr] = None
    permanent_address: Optional[str] = None
    pin_code: Optional[str] = None

    # Safety Certifications
    bosiet_done: bool = False
    bosiet_issue_date: Optional[date] = None
    bosiet_expiry_date: Optional[date] = None
    bosiet_cert_number: Optional[str] = None
    h2s_done: bool = False
    h2s_issue_date: Optional[date] = None
    h2s_expiry_date: Optional[date] = None
    stcw_done: bool = False
    stcw_issue_date: Optional[date] = None
    stcw_expiry_date: Optional[date] = None
    pdo_induction_done: bool = False
    medical_fitness_status: Optional[str] = None
    medical_cert_expiry: Optional[date] = None

    # Police Clearance
    pcc_validity: Optional[date] = None

    # Deployment
    sign_on_date: Optional[date] = None
    sign_off_date: Optional[date] = None
    pass_cancellation_date: Optional[date] = None
    current_status: Optional[str] = Field("available", pattern="^(available|active|signed_off|cancelled)$")

    # Documents
    photo_received: bool = False
    received_documents: Optional[str] = None
    remarks: Optional[str] = None

    # Professional
    total_experience_years: Optional[Decimal] = None
    experience_details: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    per_day_salary: Optional[str] = Field(None, max_length=100)

    # New Fields
    mother_name: Optional[str] = Field(None, max_length=150)
    emergency_contact_number: Optional[str] = Field(None, max_length=30)
    bank_account_number: Optional[str] = Field(None, max_length=50)
    bank_name: Optional[str] = Field(None, max_length=150)
    bank_ifsc_code: Optional[str] = Field(None, max_length=30)
    nominee_name: Optional[str] = Field(None, max_length=150)
    nominee_number: Optional[str] = Field(None, max_length=30)
    nominee_address: Optional[str] = None
    joining_date: Optional[date] = None
    ppe_boiler_suit_size: Optional[str] = Field(None, max_length=20)
    ppe_issue_date: Optional[date] = None
    ppe_shoe_size: Optional[str] = Field(None, max_length=20)
    trade_certificate_status: bool = False
    trade_certificate_issue_date: Optional[date] = None
    trade_certificate_issue_place: Optional[str] = Field(None, max_length=150)
    exit_date: Optional[date] = None
    exit_remarks: Optional[str] = None
    current_project: Optional[str] = Field(None, max_length=100)

    @field_validator('aadhar_number')
    @classmethod
    def validate_aadhar(cls, v):
        if v is not None and (not v.isdigit() or len(v) != 12):
            raise ValueError('Aadhar number must be exactly 12 digits')
        return v


class EmployeeCreate(EmployeeBase):
    """Employee creation schema"""
    pass


class EmployeeUpdate(BaseModel):
    """Employee update schema (all fields optional)"""
    full_name: Optional[str] = None
    designation: Optional[str] = None
    father_name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    languages_known: Optional[str] = None
    blood_group: Optional[str] = None
    indos_number: Optional[str] = None
    passport_number: Optional[str] = None
    passport_issue_date: Optional[date] = None
    passport_expiry_date: Optional[date] = None
    passport_issue_place: Optional[str] = None
    cdc_number: Optional[str] = None
    cdc_validity: Optional[date] = None
    cdc_received_date: Optional[date] = None
    cdc_issue_place: Optional[str] = None
    aadhar_number: Optional[str] = None
    civil_id_number: Optional[str] = None
    phone_number: Optional[str] = None
    phone_number_alt: Optional[str] = None
    email: Optional[EmailStr] = None
    permanent_address: Optional[str] = None
    pin_code: Optional[str] = None
    bosiet_done: Optional[bool] = None
    bosiet_issue_date: Optional[date] = None
    bosiet_expiry_date: Optional[date] = None
    bosiet_cert_number: Optional[str] = None
    h2s_done: Optional[bool] = None
    h2s_issue_date: Optional[date] = None
    h2s_expiry_date: Optional[date] = None
    stcw_done: Optional[bool] = None
    stcw_issue_date: Optional[date] = None
    stcw_expiry_date: Optional[date] = None
    pdo_induction_done: Optional[bool] = None
    medical_fitness_status: Optional[str] = None
    medical_cert_expiry: Optional[date] = None
    pcc_validity: Optional[date] = None
    sign_on_date: Optional[date] = None
    sign_off_date: Optional[date] = None
    pass_cancellation_date: Optional[date] = None
    current_status: Optional[str] = None
    photo_received: Optional[bool] = None
    received_documents: Optional[str] = None
    remarks: Optional[str] = None
    total_experience_years: Optional[Decimal] = None
    experience_details: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    per_day_salary: Optional[str] = Field(None, max_length=100)
    
    # New Fields
    mother_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_name: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    nominee_name: Optional[str] = None
    nominee_number: Optional[str] = None
    nominee_address: Optional[str] = None
    joining_date: Optional[date] = None
    ppe_boiler_suit_size: Optional[str] = None
    ppe_issue_date: Optional[date] = None
    ppe_shoe_size: Optional[str] = None
    trade_certificate_status: Optional[bool] = None
    trade_certificate_issue_date: Optional[date] = None
    trade_certificate_issue_place: Optional[str] = None
    exit_date: Optional[date] = None
    exit_remarks: Optional[str] = None
    current_project: Optional[str] = None


class EmployeeOut(EmployeeBase):
    """Full employee output schema"""
    id: int
    sr_no: int
    has_cv: bool = False
    has_passport_copy: bool = False
    has_ned_pass_copy: bool = False
    has_aadhar_card: bool = False
    has_pan_card: bool = False
    has_insurance: bool = False
    has_pass_cancellation: bool = False
    has_trade_cert: bool = False
    has_bosiet_cert: bool = False
    has_medical_cert: bool = False
    has_pcc_certificate: bool = False
    has_photo: bool = False
    has_other_docs: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeLimited(BaseModel):
    """Limited employee output for user role"""
    id: int
    sr_no: int
    full_name: str
    designation: str
    passport_number: str
    passport_expiry_date: Optional[date] = None
    bosiet_done: bool
    sign_on_date: Optional[date] = None
    sign_off_date: Optional[date] = None
    current_status: str
    nationality: Optional[str] = None

    class Config:
        from_attributes = True


from typing import Optional, List, Union

class EmployeeSearchResult(BaseModel):
    """Search result wrapper"""
    items: List[Union[EmployeeOut, EmployeeLimited]]
    total: int
    page: int
    limit: int
    pages: int
