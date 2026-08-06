FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Set production environment
ENV ENVIRONMENT=production

# Expose port
EXPOSE 8000

# Run with Gunicorn
CMD ["gunicorn", "app.main:app", "-c", "gunicorn_conf.py"]
