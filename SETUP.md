# OCTS Employee Management System - Setup Instructions

## Quick Start Guide

### 1. Prerequisites Installation

#### macOS/Linux:
```bash
# Install Python 3.10+
brew install python@3.11

# Install PostgreSQL
brew install postgresql

# Install Node.js
brew install node
```

#### Windows:
- Download and install [Python 3.11](https://www.python.org/downloads/)
- Download and install [PostgreSQL](https://www.postgresql.org/download/windows/)
- Download and install [Node.js](https://nodejs.org/)

### 2. PostgreSQL Setup

#### macOS/Linux:
```bash
# Start PostgreSQL
brew services start postgresql

# Connect to PostgreSQL
psql postgres

# Create user and database
CREATE USER octs_user WITH PASSWORD 'StrongPass@123';
CREATE DATABASE octs_db OWNER octs_user;
GRANT ALL PRIVILEGES ON DATABASE octs_db TO octs_user;
\q
```

#### Windows (using pgAdmin):
1. Open pgAdmin
2. Create login role "octs_user" with password "StrongPass@123"
3. Create database "octs_db" with owner "octs_user"

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Copy .env file
cp .env.example .env
# Edit .env if needed (PostgreSQL credentials)

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed database with default data
python seed.py

# Start backend server
python -m app.main
```

Backend will be running at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 4. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Copy .env file
cp .env.example .env
# Verify VITE_API_BASE_URL=http://localhost:8000

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: http://localhost:5173

### 5. Login to Application

1. Open http://localhost:5173 in your browser
2. Login with one of the default accounts:
   - **Admin**: username: `admin`, password: `Admin@OCTS#2020`
   - **Clerk**: username: `clerk1`, password: `Clerk@OCTS#2020`
   - **User**: username: `viewer1`, password: `User@OCTS#2020`

## 🔧 Troubleshooting

### Backend Issues

**ModuleNotFoundError: No module named 'app'**
```bash
# Make sure you're in the backend directory
cd backend
python -m app.main  # Use python -m instead of python app/main.py
```

**PostgreSQL Connection Refused**
```bash
# Check if PostgreSQL is running
# macOS/Linux:
brew services list | grep postgresql

# Windows:
Services -> Check PostgreSQL service status

# Restart PostgreSQL
brew services restart postgresql
```

**Port 8000 Already in Use**
```bash
# macOS/Linux:
lsof -i :8000
kill -9 <PID>

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend Issues

**Port 5173 Already in Use**
```bash
# macOS/Linux:
lsof -i :5173
kill -9 <PID>

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**API Connection Error**
- Check backend is running: http://localhost:8000/health
- Check VITE_API_BASE_URL in frontend/.env
- Check CORS settings in backend/app/config.py

**Blank Page on Frontend**
```bash
# Clear cache and rebuild
npm run build
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📋 Development Workflow

### Adding a New Employee
1. Login as Admin or Clerk
2. Click "Add Employee" or navigate to /clerk/add-employee
3. Fill the form with employee details
4. Click "Create Employee"
5. Upload documents from employee details page

### Searching Employees
1. Use the search bar on any dashboard
2. Search by: Name, Passport, Aadhar, Phone, CDC Number, Designation
3. Click employee to view full details

### Managing Users (Admin Only)
1. Go to Admin Dashboard -> User Management
2. Create new users with specific roles
3. Change user roles or deactivate users

### Exporting Data
1. Go to Admin Dashboard
2. Click "Export Excel"
3. All employee records are exported in OCTS format

## 🚀 Production Deployment

### Backend Deployment (Example: Ubuntu Server)

```bash
# Connect to server
ssh user@server-ip

# Clone repository
git clone <repo-url>
cd OCTS/backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup PostgreSQL (if not already done)
sudo apt install postgresql postgresql-contrib
# ... create database and user

# Run migrations
alembic upgrade head

# Start with Gunicorn
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:8000 app.main:app

# Or use systemd service (recommended)
```

### Frontend Deployment (Example: Nginx)

```bash
# Build production files
cd frontend
npm run build

# Copy to web server
scp -r dist/* user@server-ip:/var/www/octs

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/octs
# Add proxy configuration for backend
sudo nginx -t
sudo systemctl restart nginx
```

## 🔐 Security Checklist for Production

- [ ] Change SECRET_KEY to a 64-character random string
- [ ] Update DATABASE_URL with production credentials
- [ ] Set DEBUG=false in production
- [ ] Configure ALLOWED_ORIGINS to your domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Setup regular PostgreSQL backups
- [ ] Review and update password policies
- [ ] Configure firewall rules
- [ ] Setup monitoring and logging
- [ ] Run security audit on dependencies

## 📞 Support

For detailed documentation, see: [README.md](../README.md)

## License

Internal Application - OCTS
