from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from app.config import settings
from app.database import engine, Base
from app.routes import auth_router, employee_router, admin_router
from app.models import User, Employee, AuditLog


import time

# Create database tables with retry logic (wait for PostgreSQL to be ready)
max_retries = 3
for attempt in range(max_retries):
    try:
        Base.metadata.create_all(bind=engine)
        # Check and add phone_number column to users table
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS per_day_salary VARCHAR(100);"))
            # Safely alter column type if it already exists as DECIMAL
            conn.execute(text("ALTER TABLE employees ALTER COLUMN per_day_salary TYPE VARCHAR(100) USING per_day_salary::VARCHAR;"))
            
            # Safe migrations for Aadhar and Phone numbers
            # aadhar_number is now optional — drop NOT NULL if it was previously set
            conn.execute(text("ALTER TABLE employees ALTER COLUMN aadhar_number DROP NOT NULL;"))
            conn.execute(text("UPDATE employees SET phone_number = '0000000000-' || id WHERE phone_number IS NULL;"))
            conn.execute(text("ALTER TABLE employees ALTER COLUMN phone_number SET NOT NULL;"))
            
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_employees_aadhar') THEN
                        ALTER TABLE employees ADD CONSTRAINT uq_employees_aadhar UNIQUE (aadhar_number);
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_employees_phone') THEN
                        ALTER TABLE employees ADD CONSTRAINT uq_employees_phone UNIQUE (phone_number);
                    END IF;
                END $$;
            """))
            
            # Safe migrations for new Employee fields
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_number VARCHAR(30);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(30);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS nominee_name VARCHAR(150);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS nominee_number VARCHAR(30);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS nominee_address TEXT;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS joining_date DATE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS ppe_boiler_suit_size VARCHAR(20);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS ppe_issue_date DATE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS ppe_shoe_size VARCHAR(20);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS trade_certificate_status BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS trade_certificate_issue_date DATE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS trade_certificate_issue_place VARCHAR(150);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS exit_date DATE;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS exit_remarks TEXT;"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_project VARCHAR(100);"))
            
            # File paths columns
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS aadhar_card_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS pan_card_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS insurance_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS pass_cancellation_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS trade_certificate_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS ned_pass_copy_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS pcc_certificate_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_file_path VARCHAR(500);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_details_path VARCHAR(500);"))
        break
    except Exception as e:
        if attempt < max_retries - 1:
            print(f"Database sync notice (attempt {attempt + 1}/{max_retries}): {e}")
            time.sleep(0.5)
        else:
            print(f"Notice: Database schema creation skipped or deferred: {e}")

# Seed default users on first startup
try:
    from app.seed import seed_default_users
    seed_default_users()
except Exception as seed_err:
    print(f"Notice: User seeding skipped/deferred: {seed_err}")

# Safe update default passwords to end in 2020 if they are still using default 2024 ones
try:
    from app.models import User
    from app.database import SessionLocal
    from app.utils.security import verify_password, hash_password
    db_session = SessionLocal()
    try:
        for username, old_pwd, new_pwd in [
            ("admin", "Admin@OCTS#2024", "Admin@OCTS#2020"),
            ("clerk1", "Clerk@OCTS#2024", "Clerk@OCTS#2020"),
            ("viewer1", "User@OCTS#2024", "User@OCTS#2020")
        ]:
            db_user = db_session.query(User).filter(User.username == username).first()
            if db_user and verify_password(old_pwd, db_user.password_hash):
                db_user.password_hash = hash_password(new_pwd)
        db_session.commit()
    except Exception as inner_ex:
        db_session.rollback()
        print(f"Error resetting default passwords inside transaction: {inner_ex}")
    finally:
        db_session.close()
except Exception as outer_ex:
    print(f"Error setting up password reset script: {outer_ex}")

# Safe upload directory creation
try:
    upload_dirs = [
        Path(settings.UPLOAD_DIR) / "cv",
        Path(settings.UPLOAD_DIR) / "passports",
        Path(settings.UPLOAD_DIR) / "ned",
        Path(settings.UPLOAD_DIR) / "aadhar",
        Path(settings.UPLOAD_DIR) / "pan",
        Path(settings.UPLOAD_DIR) / "insurance",
        Path(settings.UPLOAD_DIR) / "cancellation",
        Path(settings.UPLOAD_DIR) / "trade",
        Path(settings.UPLOAD_DIR) / "bosiet",
        Path(settings.UPLOAD_DIR) / "medical",
        Path(settings.UPLOAD_DIR) / "others",
        Path(settings.UPLOAD_DIR) / "pcc",
        Path(settings.UPLOAD_DIR) / "photos",
    ]
    for upload_dir in upload_dirs:
        upload_dir.mkdir(parents=True, exist_ok=True)
except Exception as dir_err:
    print(f"Notice: Upload directory creation skipped on serverless: {dir_err}")


# Create FastAPI app
app = FastAPI(
    title="OCTS Employee Management System",
    description="Internal web application for OCTS employee records management",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Rate Limiting
try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from app.utils.logger import logger
    from app.utils.rate_limit import limiter

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception as limit_err:
    print(f"Notice: Rate limiting setup deferred: {limit_err}")

# Include routers
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(admin_router)

# Mount static files for uploads safely
try:
    if Path(settings.UPLOAD_DIR).exists():
        app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as static_err:
    print(f"Notice: Static files mount skipped: {static_err}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "OCTS Employee Management API"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "OCTS Employee Management System",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
