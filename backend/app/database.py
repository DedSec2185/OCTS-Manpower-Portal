import logging
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from app.config import settings
from typing import Generator
import os

logger = logging.getLogger("app.database")

db_url = settings.DATABASE_URL
engine_args = {
    "echo": settings.DEBUG,
}

if db_url.startswith("postgresql"):
    engine_args.update({
        "pool_pre_ping": True,
        "poolclass": pool.QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
    })
else:
    engine_args.update({
        "connect_args": {"check_same_thread": False}
    })

try:
    engine = create_engine(db_url, **engine_args)
    if db_url.startswith("postgresql"):
        # Test connection
        conn = engine.connect()
        conn.close()
        logger.info("Database connection established: PostgreSQL")
except OperationalError as e:
    # If production env variable is set, fail hard. Don't fallback to SQLite.
    if os.getenv("ENVIRONMENT") == "production":
        logger.error(f"FATAL: Database connection to '{db_url}' failed in production: {e}")
        raise e
    
    logger.warning(f"Database connection to '{db_url}' failed: {e}. Falling back to local SQLite.")
    db_file = "/tmp/octs.db" if (os.getenv("VERCEL") or os.getenv("VERCEL_ENV")) else "./octs.db"
    db_url = f"sqlite:///{db_file}"
    engine_args = {
        "echo": settings.DEBUG,
        "connect_args": {"check_same_thread": False}
    }
    engine = create_engine(db_url, **engine_args)
    logger.info(f"Database connection established: Local SQLite ({db_file})")

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base for ORM models
Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency generator for database sessions.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
