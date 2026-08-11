import logging
from logging.handlers import RotatingFileHandler
import os
import sys

def setup_logger():
    log_format = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Console handler - use stdout to avoid reentrant stderr issues with Gunicorn
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)

    # App-level logger (not root, to avoid conflicting with gunicorn)
    app_logger = logging.getLogger("octs")
    app_logger.setLevel(logging.INFO)
    
    # Prevent duplicate handlers on reload
    if not app_logger.handlers:
        app_logger.addHandler(console_handler)

    # Attempt to setup file handler, skip if filesystem is read-only (e.g. Vercel)
    try:
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        file_handler = RotatingFileHandler(
            f"{log_dir}/octs_api.log", 
            maxBytes=5*1024*1024, 
            backupCount=5
        )
        file_handler.setFormatter(log_format)
        
        if not any(isinstance(h, RotatingFileHandler) for h in app_logger.handlers):
            app_logger.addHandler(file_handler)
    except OSError as e:
        print(f"Notice: File logging disabled (read-only filesystem): {e}")

    return app_logger

logger = setup_logger()
