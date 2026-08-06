"""
Database seeding script to initialize default users and sample employees.
Run this after running: alembic upgrade head
"""

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import User, UserRole, Employee, EmployeeStatus
from app.utils import hash_password
from datetime import date, datetime, timedelta

# Create session
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()


def seed_users():
    """Create default system users"""
    
    # Check if users already exist
    if db.query(User).filter(User.username == "admin").first():
        print("Users already exist, skipping...")
        return
    
    users = [
        User(
            name="Admin User",
            email="admin@octs.com",
            username="admin",
            password_hash=hash_password("Admin@OCTS#2020"),
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            name="Data Entry Clerk",
            email="clerk1@octs.com",
            username="clerk1",
            password_hash=hash_password("Clerk@OCTS#2020"),
            role=UserRole.CLERK,
            is_active=True
        ),
        User(
            name="Viewer User",
            email="viewer1@octs.com",
            username="viewer1",
            password_hash=hash_password("User@OCTS#2020"),
            role=UserRole.USER,
            is_active=True
        ),
    ]
    
    for user in users:
        db.add(user)
    
    db.commit()
    print(f"[OK] Created {len(users)} system users")


def seed_employees():
    """Create sample employees"""
    
    # Check if employees already exist
    if db.query(Employee).first():
        print("Employees already exist, skipping...")
        return
    
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    
    employees = [
        Employee(
            sr_no=1,
            full_name="Ajay Kumar Jaylal Mahto",
            designation="6G ARC Welder",
            father_name="Jaylal Mahto",
            dob=date(1985, 5, 15),
            gender="Male",
            nationality="Indian",
            religion="Hindu",
            marital_status="Married",
            blood_group="O+",
            passport_number="R3669417",
            passport_expiry_date=date(2028, 6, 10),
            aadhar_number="315824682286",
            phone_number="+91-9876543210",
            email="ajay.mahto@email.com",
            permanent_address="Village Pipra, District Saran, Bihar",
            bosiet_done=True,
            bosiet_expiry_date=date(2026, 3, 31),
            h2s_done=True,
            h2s_expiry_date=date(2025, 12, 31),
            pcc_validity=date(2020, 12, 31),
            cdc_number="MR/SEC/PASS/2025/9898",
            cdc_validity=date(2025, 3, 31),
            sign_on_date=date(2020, 1, 31),
            current_status=EmployeeStatus.ACTIVE,
            photo_received=True,
            received_documents="Paper Pass Received",
            remarks="Excellent welder, multiple certifications",
            total_experience_years=18.5,
            experience_details="18+ years in offshore welding",
            skills="Arc Welding, Pipe Welding, Pressure Vessel Welding",
            created_by_id=admin.id,
        ),
        Employee(
            sr_no=2,
            full_name="Ramesh Kumar Singh",
            designation="Rigger",
            father_name="Suresh Kumar Singh",
            dob=date(1988, 8, 22),
            gender="Male",
            nationality="Indian",
            passport_number="S2847391",
            passport_expiry_date=date(2027, 9, 15),
            aadhar_number="425916734521",
            phone_number="+91-9123456789",
            email="ramesh.singh@email.com",
            bosiet_done=True,
            bosiet_expiry_date=date(2025, 8, 30),
            current_status=EmployeeStatus.AVAILABLE,
            received_documents="All Documents",
            remarks="Experienced rigger with multiple offshore assignments",
            total_experience_years=15.0,
            created_by_id=admin.id,
        ),
        Employee(
            sr_no=3,
            full_name="Vikram Kumar Patel",
            designation="Scaffolder",
            father_name="Mukesh Patel",
            dob=date(1990, 3, 10),
            gender="Male",
            nationality="Indian",
            passport_number="P7283941",
            passport_expiry_date=date(2026, 4, 20),
            aadhar_number="987654321098",
            phone_number="+91-8765432109",
            email="vikram.patel@email.com",
            bosiet_done=True,
            bosiet_expiry_date=date(2026, 6, 15),
            h2s_done=True,
            h2s_expiry_date=date(2025, 10, 10),
            current_status=EmployeeStatus.ACTIVE,
            sign_on_date=date(2020, 2, 15),
            remarks="Safety-conscious, reliable",
            total_experience_years=12.0,
            created_by_id=admin.id,
        ),
        Employee(
            sr_no=4,
            full_name="Ashok Kumar Sharma",
            designation="Electrician",
            father_name="Ram Prasad Sharma",
            dob=date(1986, 11, 5),
            gender="Male",
            nationality="Indian",
            passport_number="E5612784",
            passport_expiry_date=date(2027, 1, 30),
            aadhar_number="654321987654",
            phone_number="+91-7654321098",
            email="ashok.sharma@email.com",
            current_status=EmployeeStatus.AVAILABLE,
            remarks="High voltage and low voltage expertise",
            total_experience_years=20.0,
            created_by_id=admin.id,
        ),
        Employee(
            sr_no=5,
            full_name="Pradeep Kumar Yadav",
            designation="Fitter",
            father_name="Harendra Kumar Yadav",
            dob=date(1987, 7, 18),
            gender="Male",
            nationality="Indian",
            passport_number="F8934521",
            passport_expiry_date=date(2028, 2, 14),
            aadhar_number="321654987321",
            phone_number="+91-9512345678",
            email="pradeep.yadav@email.com",
            bosiet_done=True,
            bosiet_expiry_date=date(2025, 5, 20),
            current_status=EmployeeStatus.SIGNED_OFF,
            sign_on_date=date(2020, 6, 1),
            sign_off_date=date(2020, 1, 15),
            remarks="Completed long-term offshore assignment",
            total_experience_years=16.5,
            created_by_id=admin.id,
        ),
    ]
    
    for emp in employees:
        db.add(emp)
    
    db.commit()
    print(f"[OK] Created {len(employees)} sample employees")


if __name__ == "__main__":
    try:
        print("\n=== OCTS Database Seeding ===\n")
        seed_users()
        seed_employees()
        print("\n[OK] Database seeding completed successfully!")
        print("\nDefault Login Credentials:")
        print("  Admin:   username=admin   password=Admin@OCTS#2020")
        print("  Clerk:   username=clerk1  password=Clerk@OCTS#2020")
        print("  User:    username=viewer1 password=User@OCTS#2020")
        print()
    except Exception as e:
        print(f"[ERROR] Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()
