import multiprocessing
import os

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
keepalive = 120
errorlog = "logs/gunicorn_error.log"
accesslog = "logs/gunicorn_access.log"
loglevel = "info"
