from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql://octs_user:StrongPass@123@localhost:5432/octs_db"
    
    # Security
    SECRET_KEY: str = "replace-with-64-character-random-string-for-jwt-signing-octs"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    
    # File uploads
    UPLOAD_DIR: str = "employee_docs"
    MAX_FILE_SIZE_MB: int = 20
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Debug
    DEBUG: bool = True

    # SMTP Settings
    SMTP_USER: str = "abhayrajs366@gmail.com"
    SMTP_PASSWORD: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    
    # Twilio Settings
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
