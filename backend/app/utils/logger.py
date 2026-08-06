import logging
from logging.handlers import RotatingFileHandler
import os
import sys

def setup_logger():
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_format = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # File handler with rotation (max 5MB per file, keep 5 backups)
    file_handler = RotatingFileHandler(
        f"{log_dir}/octs_api.log", 
        maxBytes=5*1024*1024, 
        backupCount=5
    )
    file_handler.setFormatter(log_format)

    # Console handler - use stdout to avoid reentrant stderr issues with Gunicorn
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)

    # App-level logger (not root, to avoid conflicting with gunicorn)
    app_logger = logging.getLogger("octs")
    app_logger.setLevel(logging.INFO)
    
    # Prevent duplicate handlers on reload
    if not app_logger.handlers:
        app_logger.addHandler(file_handler)
        app_logger.addHandler(console_handler)

    return app_logger

logger = setup_logger()
