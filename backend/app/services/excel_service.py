from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from io import BytesIO
from typing import List
from app.models import Employee
from datetime import date


def export_to_excel(employees: List[Employee]) -> BytesIO:
    """
    Export employees to Excel file matching original OCTS format with expanded columns.
    
    Returns:
        BytesIO stream containing Excel file
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "Employees"
    
    # Define column headers in exact order from original Excel + new fields
    headers = [
        "Sr.No",
        "Name",
        "Designation",
        "Passport",
        "Aadhar Card",
        "BOSIET",
        "Photo",
        "PCC Validity",
        "Received Documents",
        "Remark",
        "NED PASS NO",
        "NED PASS VALIDITY",
        "NED PASS RECEIVED",
        "Pass Cancellation",
        "Sign On",
        "Sign Off",
        "Salary/Day",
        "Current Project",
        # New Fields
        "Mother's Name",
        "Emergency Phone",
        "Bank Name",
        "Account Number",
        "IFSC Code",
        "Nominee Name",
        "Nominee Number",
        "Nominee Address",
        "Joining Date",
        "Boiler Suit Size",
        "PPE Issue Date",
        "Shoe Size",
        "Has Trade Certificate",
        "Trade Cert Issue Date",
        "Trade Cert Issue Place",
        "Exit Date",
        "Exit Remarks"
    ]
    
    # Add header row with styling
    ws.append(headers)
    
    header_fill = PatternFill(start_color="0A1628", end_color="0A1628", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=11)
    
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    # Add data rows
    for emp in employees:
        row = [
            emp.sr_no,
            emp.full_name,
            emp.designation or "",
            emp.passport_number or "",
            emp.aadhar_number or "",
            "√" if emp.bosiet_done else "",
            "√" if emp.photo_received else "",
            format_date(emp.pcc_validity),
            emp.received_documents or "",
            emp.remarks or "",
            emp.cdc_number or "",
            format_date(emp.cdc_validity),
            format_date(emp.cdc_received_date),
            format_date(emp.pass_cancellation_date),
            format_date(emp.sign_on_date),
            format_date(emp.sign_off_date),
            emp.per_day_salary if emp.per_day_salary else "",
            emp.current_project or "",
            # New Fields
            emp.mother_name or "",
            emp.emergency_contact_number or "",
            emp.bank_name or "",
            emp.bank_account_number or "",
            emp.bank_ifsc_code or "",
            emp.nominee_name or "",
            emp.nominee_number or "",
            emp.nominee_address or "",
            format_date(emp.joining_date),
            emp.ppe_boiler_suit_size or "",
            format_date(emp.ppe_issue_date),
            emp.ppe_shoe_size or "",
            "Yes" if emp.trade_certificate_status else "No",
            format_date(emp.trade_certificate_issue_date),
            emp.trade_certificate_issue_place or "",
            format_date(emp.exit_date),
            emp.exit_remarks or ""
        ]
        ws.append(row)
    
    # Auto-adjust column widths dynamically based on max value lengths
    for col in ws.columns:
        max_len = 0
        for cell in col:
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        col_letter = col[0].column_letter
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)
    
    # Center align all columns except Name and Remarks (which should be left-aligned)
    for row_idx, row in enumerate(ws.iter_rows(min_row=2, max_row=len(employees)+1, min_col=1, max_col=len(headers))):
        for col_idx, cell in enumerate(row):
            # Name (col B = index 1), Nominee Address (col Y = index 24), Exit Remarks (col AI = index 34)
            # Experience/Remarks (col I = index 8, col J = index 9) are left-aligned
            if col_idx in [1, 8, 9, 24, 34]:
                cell.alignment = Alignment(horizontal="left", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="center", vertical="center")
    
    # Convert to BytesIO
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    
    return output


def format_date(date_obj: date) -> str:
    """Format date as DD-MM-YYYY for Excel"""
    if not date_obj:
        return ""
    return date_obj.strftime("%d-%m-%Y")
