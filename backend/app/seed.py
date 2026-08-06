"""
Database seeder — creates default users on first startup.
Only runs if the users table is empty.
"""
from sqlalchemy.orm import Session
from app.models import User, UserRole
from app.utils import hash_password
from app.database import SessionLocal
import logging

logger = logging.getLogger("octs")


def seed_default_users():
    """Create default admin, clerk, and viewer users if none exist."""
    db: Session = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            logger.info(f"Database already has {user_count} users. Skipping seed.")
            return

        logger.info("No users found — seeding default users...")

        default_users = [
            User(
                name="System Administrator",
                email="admin@octs.com",
                username="admin",
                password_hash=hash_password("Admin@OCTS#2020"),
                role=UserRole.ADMIN,
                is_active=True,
            ),
            User(
                name="Office Clerk",
                email="clerk1@octs.com",
                username="clerk1",
                password_hash=hash_password("Clerk@OCTS#2020"),
                role=UserRole.CLERK,
                is_active=True,
            ),
            User(
                name="Office Viewer",
                email="viewer1@octs.com",
                username="viewer1",
                password_hash=hash_password("User@OCTS#2020"),
                role=UserRole.USER,
                is_active=True,
            ),
        ]

        for user in default_users:
            db.add(user)

        db.commit()
        logger.info(f"Successfully seeded {len(default_users)} default users.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding default users: {e}")
    finally:
        db.close()
