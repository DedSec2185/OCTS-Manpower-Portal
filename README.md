# OCTS - Employee Management System

A comprehensive web application for managing and tracking employee records, certifications, and deployment information for Oceanic Construction and Technical Services (OCTS).

## 🌟 Features

### Employee Management
- **Complete Employee Records**: Store comprehensive employee information including personal, passport, CDC/NED Pass, identity documents, contact information, safety certifications, and deployment details
- **Sr.No Auto-Assignment**: Sequential serial numbers automatically assigned
- **Document Management**: Upload and download employee files (CV, photos, certificates)
- **Advanced Search**: Search by multiple fields - name, passport, Aadhar, phone, CDC number, designation
- **Status Tracking**: Active, Available, Signed Off, Cancelled status management

### Certifications & Compliance
- **BOSIET Tracking**: Monitor BOSIET certification status and validity dates
- **H2S, STCW Tracking**: Keep track of safety certifications
- **Medical Fitness**: Medical certificate expiry tracking
- **CDC/NED Pass Management**: CDC book tracking and expiry alerts
- **PCC Validity**: Police clearance certificate monitoring

### User Management
- **Role-Based Access**: Admin, Clerk, User roles with different permissions
- **Admin Dashboard**: Comprehensive admin panel with statistics and controls
- **Clerk Interface**: Data entry and employee record management
- **User Search**: Limited search interface for viewing employee information

### Admin Features
- **Dashboard Statistics**: Overview of total employees, deployments, expirations
- **Excel Export**: Export all employee records to Excel
- **Audit Logging**: Complete audit trail of all system changes
- **User Management**: Create, manage, and deactivate system users

### Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Permission checks on all endpoints
- **Password Hashing**: Bcrypt password hashing
- **Audit Trail**: Complete logging of all actions
- **CORS Protection**: Cross-origin resource sharing configuration

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Python-Jose)
- **File Upload**: MultiPart form data
- **Excel Export**: openpyxl
- **Migrations**: Alembic
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Styling**: CSS3 (Custom properties & Grid)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Database Schema

### Key Tables

#### users
```sql
- id (Primary Key)
- name (String)
- email (Unique)
- username (Unique)
- password_hash
- role (admin/clerk/user)
- is_active (Boolean)
- created_at, updated_at
```

#### employees
```sql
- id (Primary Key)
- sr_no (Auto-incremented)
- Personal: full_name, dob, gender, nationality, religion, marital_status, blood_group
- Passport: passport_number, issue_date, expiry_date, issue_place
- CDC/NED: cdc_number, cdc_validity, cdc_received_date
- Identity: aadhar_number, civil_id_number
- Contact: phone_number, email, permanent_address, pin_code
- Certifications: bosiet_done, h2s_done, stcw_done, pdo_induction_done
- Deployment: sign_on_date, sign_off_date, current_status
- Files: cv_pdf_path, photo_file_path, passport_copy_path, etc.
- Audit: created_by_id, created_at, updated_by_id, updated_at
```

#### audit_logs
```sql
- id (Primary Key)
- user_id (Foreign Key)
- action (CREATE/UPDATE/DELETE/EXPORT/FILE_UPLOAD/FILE_DOWNLOAD)
- table_name, record_id
- old_value, new_value (JSON)
- ip_address
- created_at
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup PostgreSQL**
   ```sql
   CREATE USER octs_user WITH PASSWORD 'StrongPass@123';
   CREATE DATABASE octs_db OWNER octs_user;
   GRANT ALL PRIVILEGES ON DATABASE octs_db TO octs_user;
   ```

5. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

6. **Run migrations**
   ```bash
   alembic upgrade head
   ```

7. **Seed database**
   ```bash
   python seed.py
   ```

8. **Start backend server**
   ```bash
   python -m app.main
   # or
   uvicorn app.main:app --reload
   ```
   
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   # Verify VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/register` - Register new user (admin only)
- `PATCH /auth/change-password` - Change password

### Employees
- `POST /employees` - Create employee
- `GET /employees` - Get all employees (paginated, admin only)
- `GET /employees/search` - Search employees
- `GET /employees/{id}` - Get employee details
- `PATCH /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee
- `POST /employees/{id}/upload/{doc_type}` - Upload document
- `GET /employees/{id}/download/{doc_type}` - Download document

### Admin
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/employees/export-excel` - Export to Excel
- `GET /admin/audit-logs` - Get audit logs
- `GET /admin/users` - List all users
- `POST /admin/users` - Create user
- `PATCH /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user

## 👥 User Roles & Permissions

### Admin
- Full system access
- Create/edit/delete employees
- Export data to Excel
- View audit logs
- Manage users

### Clerk
- Add new employees
- Edit existing employees
- Upload/download documents
- Search employees
- View employee details

### User
- Search employees
- View limited employee information
- Download CV files only

## 📂 Project Structure

```
OCTS/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI application
│   ├── alembic/             # Database migrations
│   ├── uploads/             # Uploaded files storage
│   ├── requirements.txt
│   ├── seed.py              # Database seeding
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # React components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS stylesheets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/              # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
└── README.md
```

## 🔐 Default Credentials

After running `seed.py`, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@OCTS#2020 |
| Clerk | clerk1 | Clerk@OCTS#2020 |
| User | viewer1 | User@OCTS#2020 |

**⚠️ Change these passwords immediately in production!**

## 🔒 Security Best Practices

1. **Change SECRET_KEY in production** - Generate a strong 64-character key
2. **Use environment variables** - Never commit sensitive data
3. **Enable HTTPS** - Use SSL certificates in production
4. **Update ALLOWED_ORIGINS** - Configure CORS properly
5. **Database backups** - Regular PostgreSQL backups
6. **Audit logs** - Monitor audit_logs table regularly
7. **Access control** - Implement strict role-based permissions
8. **Password policies** - Enforce strong passwords for all users

## 📦 Deployment

### Using Docker (Optional)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Deployment

1. **Backend**: Deploy to server with Gunicorn/Uvicorn
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
   ```

2. **Frontend**: Build and deploy static files
   ```bash
   npm run build
   # Deploy dist/ folder to web server
   ```

## 🐛 Troubleshooting

### Backend Issues

**PostgreSQL Connection Error**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure user has correct permissions

**Alembic Migration Error**
- Run: `alembic current` to check current version
- Run: `alembic downgrade -1` to rollback
- Run: `alembic upgrade head` to upgrade

**Port Already in Use**
- Backend: `lsof -i :8000` and kill the process
- Frontend: `lsof -i :5173` and kill the process

### Frontend Issues

**API Connection Error**
- Verify backend is running at http://localhost:8000
- Check VITE_API_BASE_URL in .env
- Check CORS configuration in backend

**Module Not Found**
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

## 📞 Support & Contact

For issues or questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review audit logs for system activity
3. Check application logs for errors

## 📄 License

OCTS Employee Management System - Internal Application

---

**Version**: 1.0.0  
**Last Updated**: 2020  
**Environment**: Production Ready
