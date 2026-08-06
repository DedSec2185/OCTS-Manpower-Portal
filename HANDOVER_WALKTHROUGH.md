# 🚢 OCTS Employee Management Portal — Complete Handover Guide

**Prepared for:** Anil (Master Admin / Business Owner)  
**Prepared by:** Development Team  
**Version:** 1.4 — Project Assignment & Filtering
**Date:** June 2026 (Updated)

---

## 📌 Table of Contents

1. [What Is This System?](#1-what-is-this-system)
2. [What Has Been Built — Feature Overview](#2-what-has-been-built-—-feature-overview)
3. [How the System Works (Architecture)](#3-how-the-system-works-architecture)
4. [How to Start & Stop the Portal](#4-how-to-start--stop-the-portal)
5. [First-Time Setup on the Company Computer](#5-first-time-setup-on-the-company-computer)
6. [Logging In — Who Can Log In and How](#6-logging-in-—-who-can-log-in-and-how)
7. [The Admin (Anil's) Dashboard — Full Walkthrough](#7-the-admin-anils-dashboard-—-full-walkthrough)
8. [The Clerk Dashboard — What a Clerk Can Do](#8-the-clerk-dashboard-—-what-a-clerk-can-do)
9. [The Viewer Dashboard — What a Viewer Can Do](#9-the-viewer-dashboard-—-what-a-viewer-can-do)
10. [User Management — Creating Staff Accounts](#10-user-management-—-creating-staff-accounts)
11. [Employee Records — Adding & Editing](#11-employee-records-—-adding--editing)
12. [Salary System](#12-salary-system)
13. [Document Management](#13-document-management)
14. [Exporting the Master Excel Sheet](#14-exporting-the-master-excel-sheet)
15. [Audit Logs — Who Did What and When](#15-audit-logs-—-who-did-what-and-when)
16. [Day-to-Day Operations & Network Access](#16-day-to-day-operations--network-access)
    - [Accessing on Mobile Devices & Other PCs (Local Wi-Fi)](#accessing-on-mobile-devices--other-pcs-local-wi-fi)
    - [Temporary Public Access (Ngrok & Localhost.run)](#temporary-public-access-ngrok--localhostrun)
17. [Data Backup & Recovery](#17-data-backup--recovery)
18. [Troubleshooting Common Problems](#18-troubleshooting-common-problems)
19. [Security Best Practices](#19-security-best-practices)
20. [Important Credentials & Settings](#20-important-credentials--settings)

---

## 1. What Is This System?

The **OCTS Employee Management Portal** is a private, internal web application built exclusively for **Oceanic Construction and Technical Services (OCTS)**. It replaces manual Excel sheets and paper-based record-keeping with a secure, centralized digital system.

**What it does:**
- Stores complete records for every offshore manpower employee.
- Tracks certifications (BOSIET, H2S, STCW), passport validity, CDC/NED passes.
- Manages deployment status (Active, Available, Signed Off, Cancelled).
- Tracks platform and project assignments (e.g. OCS - Panna, Technocrats - Tapti).
- Stores and retrieves uploaded documents (CVs, passports, medical certs).
- Tracks per-day salary for all employees (visible only to Admin).
- Exports a master Excel sheet with all employee data at any time.
- Provides a full audit trail of every change made in the system.
- Allows Anil to create login accounts for his office staff with specific roles.
- **Works flawlessly on mobile phones** (fully responsive layout) so clerks or administrators can manage records on the go.

**It runs entirely on your own company computer — no internet or cloud subscription needed.**

---

## 2. What Has Been Built — Feature Overview

### ✅ Employee Records
- **55+ fields** per employee covering identity, contact, certifications, deployment, salary, documents.
- Auto-incrementing serial numbers for each employee.
- Soft-delete with audit trail (deleted records are logged, not permanently lost).

### ✅ Three-Level Role System
| Role | What They Can Do |
|------|-----------------|
| **Admin** (Anil) | Everything — create users, view/edit salaries, edit all records, delete, export Excel, view audit logs. |
| **Clerk** | Add new employees, edit existing employee details (except salary), search and view all records. |
| **Viewer** | Search and view employee records only — cannot add or edit anything. |

### ✅ User Management
- Admin can create unlimited staff accounts.
- Set username, password, and role for each staff member.
- Deactivate accounts when staff leaves without deleting history.
- Staff can update their own name and password after logging in.

### ✅ Salary System
- Per-day salary is set by the Clerk when adding a new employee.
- **Once set, salary CANNOT be changed by a Clerk** — only Admin can update it.
- Salary is hidden from Viewer role entirely.
- Salary is included in the master Excel export (Admin only).

### ✅ Document Management
- Upload and download: CV, Passport Photo, Passport Copy, CDC Copy, BOSIET Certificate, Medical Certificate, Other Documents.
- File size limit: 20 MB per file.
- Files stored securely on the server.

### ✅ Excel Export
- One-click export of all employee records to `.xlsx`.
- Includes salary column (Admin download only).
- Formatted as "OCTS Manpower" master sheet.

### ✅ Audit Logs
- Every add, edit, delete, or login is permanently recorded.
- Shows: who did it, what they changed, when it happened.

### ✅ Security
- Passwords are encrypted (bcrypt hashing — not stored in plain text).
- Login sessions expire after 8 hours automatically.
- Rate limiting: max 5 failed login attempts per minute per IP.
- All data access requires authentication.

---

## 3. How the System Works (Architecture)

The portal runs as **three services** on your company computer, managed automatically by Docker:

```
┌───────────────────────────────────────────────────────────────────┐
│                          Company Computer                         │
│                                                                   │
│  ┌──────────────────────┐        ┌──────────────┐                 │
│  │       Frontend       │        │   Backend    │                 │
│  │ (Nginx Web Entryway) ├───────►│  (API Server │                 │
│  │    Port 80 (HTTP)    │        │  Port 8000)  │                 │
│  │                      │◄───────┤              │                 │
│  └──────────┬───────────┘        └──────┬───────┘                 │
│             │                           │                         │
│             │ /api relative routes      │                         │
│             ▼                           ▼                         │
│     [Employee Docs Volume]      ┌───────────────┐                 │
│     (backend/employee_docs)     │  PostgreSQL   │                 │
│                                 │   Database    │                 │
│                                 │   Port 5432   │                 │
│                                 └───────────────┘                 │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      │ Any browser on the local WiFi/LAN network accesses:   │
      │                                                       │
      │   - http://localhost         (on the same PC)         │
      │   - http://192.168.x.x       (from mobile/other PCs)  │
      └───────────────────────────────────────────────────────┘
```

### 💡 The Nginx Reverse Proxy Fix (Mobile Access)
Previously, accessing the site from a mobile phone would fail to log in because the phone could not reach `localhost:8000` (the backend api). Windows Firewall also blocked direct access to Port 8000.

**The Solution:** We configured the Frontend container to run **Nginx** on **Port 80**. 
- It serves the website interface.
- It intercepts any request starting with `/api` and forwards it to the backend api internally.
- It intercepts any request starting with `/uploads` and loads documents from the folder directly.
- **Benefit:** Mobile phones and other PCs only need to open `http://<IP-Address>` on Port 80. The phone never needs to communicate with Port 8000 directly, resolving all login blocks and firewall issues.

---

## 4. How to Start & Stop the Portal

### ▶️ Starting the Portal

1. Make sure **Docker Desktop** is open and running (look for the whale icon in the system tray).
2. Open **PowerShell** (right-click Start → Windows PowerShell).
3. Type the following and press Enter:
   ```powershell
   cd C:\Users\abhay\Desktop\OCTS
   docker compose up -d
   ```
4. Wait about 30 seconds, then open any browser and go to: **http://localhost**

> [!TIP]
> If Docker Desktop is set to "Start on boot", the portal starts **automatically when the computer is turned on** — you don't need to do anything.

### ⏹️ Stopping the Portal

```powershell
cd C:\Users\abhay\Desktop\OCTS
docker compose down
```

### 🔄 Restarting After Making Changes

```powershell
cd C:\Users\abhay\Desktop\OCTS
docker compose down
docker compose up -d --build
```

---

## 5. First-Time Setup on the Company Computer

> [!IMPORTANT]
> This only needs to be done **once** when setting up on a new or fresh computer.

### Prerequisites
1. **Install Docker Desktop**: Download from https://www.docker.com/products/docker-desktop
   - During install, keep all default options.
   - Restart the computer after install.

2. **Copy the OCTS Folder**: Copy the entire `OCTS` folder to `C:\Users\[username]\Desktop\OCTS`

3. **First Launch**:
   ```powershell
   cd C:\Users\abhay\Desktop\OCTS
   docker compose up -d --build
   ```
   - The first build takes **5–10 minutes** (downloading dependencies).
   - Subsequent starts take under 30 seconds.

4. **Verify Everything is Running**:
   ```powershell
   docker compose ps
   ```
   All three services should show **Up** status.

5. **Access the portal**: Open browser → http://localhost

### 🔧 Make Docker Start Automatically on Boot

1. Open Docker Desktop.
2. Go to **Settings → General**.
3. Enable **"Start Docker Desktop when you sign in to your computer"**.

This ensures the OCTS portal is always available without manual intervention.

---

## 6. Logging In — Who Can Log In and How

Open any web browser and go to: **http://localhost** (or your local IP address).

The login page will appear. Enter your **username** and **password**.

### Default Accounts (Change These Immediately!)

| Role | Username | Default Password | Who Uses This |
|------|----------|-----------------|---------------|
| **Admin** | `admin` | `Admin@OCTS#2020` | Anil (Master Admin) |
| **Clerk** | `clerk1` | `Clerk@OCTS#2020` | Data entry staff |
| **Viewer** | `viewer1` | `User@OCTS#2020` | Read-only staff |

> [!CAUTION]
> **Change the default admin password immediately after first login!**
> Go to your Profile (top-right corner of the screen) → Change Password.

### What Happens After Login

- **Admin** → Redirected to **Operations Dashboard** with full controls.
- **Clerk** → Redirected to **Clerk Dashboard** with add/edit/search tools.  
- **Viewer** → Redirected to **Viewer Dashboard** with search and view only.

Sessions stay active for **8 hours**, after which you're automatically logged out for security.

---

## 7. The Admin Dashboard — Full Walkthrough

After logging in as admin, you see the **Operations Dashboard**.

### 📊 Top Stats Row
Shows live counts pulled directly from the database:
- **Total Employees** — all employees in the system.
- **Active Deployments** — currently signed on (status = Active).
- **Available Workers** — ready to deploy.
- **Signed Off** — recently returned.
- **Cancelled** — cancelled deployments.

### 📈 Designations Breakdown
A horizontal bar chart showing how many employees exist per designation (Welder, Rigger, Scaffolder, etc.). Auto-updates as you add employees.

### ⚡ Quick Actions Panel
Shortcuts to the three most common tasks:
- Register Employee.
- Search Employees.
- Full Records View.

### 👥 Employee Master Table
The full list of all employees with quick-search. Click any row to:
- **View** full employee details.
- **Edit** employee record.
- **Delete** employee (with confirmation prompt).

### 🗂️ Sidebar Navigation (Left Side)
On desktop, the sidebar is fixed. On mobile, click the **hamburger menu (three bars)** in the top navbar to toggle the sidebar menu.

| Menu Item | What It Does |
|-----------|-------------|
| Dashboard | Home overview page. |
| Employees | Full employee records list with pagination. |
| Add Employee | Form to register a new employee. |
| Search | Advanced search by name, passport, Aadhar, phone, CDC, designation, or project. |
| User Management | Create/edit/deactivate staff accounts. |
| Audit Logs | View all system activity history. |
| My Profile | Change your own name and password. |

---

## 8. The Clerk Dashboard — What a Clerk Can Do

Clerks see a focused dashboard with the tools they need for data entry work.

### What a Clerk CAN do:
- ✅ Add new employee records (all fields including setting initial salary).
- ✅ Edit existing employee details.
- ✅ Upload and download employee documents.
- ✅ Search employees by any field.
- ✅ View complete employee profiles.
- ✅ Change their own password.

### What a Clerk CANNOT do:
- ❌ Change employee salary (locked after creation).
- ❌ Delete employees.
- ❌ View or manage other user accounts.
- ❌ Export the master Excel file.
- ❌ View audit logs.
- ❌ See Admin-only sections.

---

## 9. The Viewer Dashboard — What a Viewer Can Do

Viewers get a read-only window into the employee database.

### What a Viewer CAN do:
- ✅ Search employees by name, passport, Aadhar, phone, CDC number.
- ✅ View full employee profile (except salary — hidden).
- ✅ View uploaded documents.
- ✅ Change their own password.

### What a Viewer CANNOT do:
- ❌ Add or edit any employee record.
- ❌ See salary information.
- ❌ Delete anything.
- ❌ See user management or audit logs.
- ❌ Export data.

---

## 10. User Management — Creating Staff Accounts

**Only the Admin (Anil) can manage user accounts.**

### How to Create a New User

1. Log in as admin.
2. Click **"User Management"** in the left sidebar.
3. Click **"Create New User"** button.
4. Fill in the form:
   - **Full Name**: e.g., "Ravi Kumar"
   - **Email**: e.g., `ravi@octs.com`
   - **Username**: e.g., `ravi` (used for login)
   - **Password**: Set a strong password.
   - **Role**: Choose **Admin**, **Clerk**, or **Viewer**.
5. Click **Save**.

### How to Edit a User
1. Go to User Management.
2. Find the user in the table and click the **Edit** (pencil) icon.
3. Change name, role, or reset their password.
4. Save changes.

### How to Deactivate a User (When Staff Leaves)
1. Go to User Management.
2. Find the user, click Edit, and toggle **"Active"** to Off.
3. Save. The user will be **immediately locked out**.

### Navbar & Notifications
The top navigation bar provides quick access to system features:
- **Dashboard Title:** Shows your current location.
- **Notifications (Bell Icon):** Click the bell icon to open the **Recent Activity Popover** showing the 5 most recent system actions.
- **User Profile:** Shows your initial and username.
- **Logout:** Click the door/exit icon to securely sign out.

### Roles Summary Quick Reference

| Action | Admin | Clerk | Viewer |
|--------|-------|-------|--------|
| View employees | ✅ | ✅ | ✅ |
| Add employees | ✅ | ✅ | ❌ |
| Edit employees | ✅ | ✅ | ❌ |
| Delete employees | ✅ | ❌ | ❌ |
| View salary | ✅ | ❌ | ❌ |
| Edit salary | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| Download documents | ✅ | ✅ | ✅ |
| Export Excel | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |

---

## 11. Employee Records — Adding & Editing

### Adding a New Employee

1. Go to **Add Employee** from the sidebar.
2. Fill in the form — it is divided into clear sections:

| Section | Fields Covered |
|---------|---------------|
| **Personal Info** | Full name, designation, father's name, DOB, gender, nationality, religion, marital status, blood group, INDOS number. |
| **Passport Details** | Passport number, issue date, expiry date, issue place. |
| **CDC / NED Pass** | CDC number, validity, received date, issue place. |
| **Identity Documents** | Aadhar number, Civil ID. |
| **Contact Info** | Phone, alternate phone, email, permanent address, PIN code. |
| **Safety Certifications** | BOSIET, H2S, STCW, PDO Induction — each with date fields. |
| **Medical & PCC** | Fitness status, medical cert expiry, PCC validity. |
| **Deployment** | Sign on date, sign off date, current status, project assignment. |
| **Documents Checklist** | Photo received toggle, received documents list. |
| **Professional** | Experience years, experience details, education, skills, remarks. |
| **Platform/Salary** ⭐ | **Per-day salary** (set once by Clerk, only editable by Admin after). |

3. Click **Submit** to save.

> [!IMPORTANT]
> The **Passport Number**, **Aadhar Number** (exactly 12 digits), and **Phone Number** are required and must be unique for each employee. The system will reject duplicates.

### Editing an Existing Employee

1. Find the employee (via Dashboard table or Search).
2. Click the **Edit** button on their record.
3. Update any field and click **Save Changes**.

> [!NOTE]
> Clerks editing an employee will see all fields **except** the salary field — that section only appears for Admins.

### Viewing Full Employee Details
Click **View** on any employee to see their complete profile including:
- All personal and certification data.
- Document download links.
- Deployment history & remarks.

---

## 12. Salary System

The salary system is designed with strict access control.

### How It Works

1. **When adding a new employee**: The Clerk (or Admin) enters the **per-day salary (₹)** in the Platform/Salary section of the Add Employee form.
2. **After creation**: The salary field is **locked for Clerks** — they cannot see or change it.
3. **Admin can always**: View and update the salary of any employee through the Edit screen.
4. **Excel export**: The per-day salary column is included in the Excel file that only Admin can download.

---

## 13. Document Management

Each employee can have up to **11 document types** attached:

| Document Type | Use Case |
|--------------|----------|
| CV / Resume PDF | Candidate profile. |
| Passport Copy | Scanned passport pages. |
| NED Pass Copy | Continuous Discharge Certificate / NED Pass Copy. |
| Aadhar Card PDF | Aadhar card copy in PDF. |
| PAN Card PDF | PAN card copy in PDF. |
| Insurance PDF | Insurance policy/details PDF. |
| Pass Cancellation PDF | Pass cancellation document. |
| Trade Certificate | Trade certificate copy. |
| BOSIET Certificate | Safety certification. |
| Medical Certificate | Medical fitness proof. |
| Other Documents | Any additional paperwork. |

### Uploading Documents
You can upload documents at any time. Documents are stored in dedicated folders per employee (e.g., `backend/employee_docs/<employee_id>/`).

**During Employee Creation:**
1. Fill out the "Register New Employee" form and click **Create Employee**.
2. Immediately upon success, the form will switch to "Edit Mode" and a **Document Uploads** section will appear at the bottom of the page.
3. Click "Upload" next to the relevant document type to attach files immediately.

**For Existing Employees:**
1. Open the employee's details page.
2. Find the **Documents** section tab.
3. Click **Upload** next to the relevant document type.
4. Select the file (PDF, JPG, PNG — max 20 MB).
5. The file is saved automatically to the employee's folder.

---

## 14. Exporting the Master Excel Sheet

> [!NOTE]
> Only **Admin** can export the Excel file.

### How to Export

1. Log in as admin.
2. On the dashboard, click the **"📥 Export Excel"** button (top-right).
3. A file named `OCTS_MANPOWER_export.xlsx` will download to your browser's Downloads folder.

---

## 15. Audit Logs — Who Did What and When

The audit log is a permanent record of every action taken in the system.

### How to View Audit Logs
1. Log in as admin.
2. Click **"Audit Logs"** in the sidebar.
3. View the chronological list of all system events.

---

## 16. Day-to-Day Operations & Network Access

### Accessing on Mobile Devices & Other PCs (Local Wi-Fi)

If other computers or mobile phones on the **same office network (WiFi or LAN)** need to access the portal:

1. **Find the IP address of the main computer** running the portal:
   - On the main PC, open **PowerShell** and type:
     ```powershell
     ipconfig
     ```
   - Look for the **IPv4 Address** under your active connection (e.g., `192.168.29.232` or `192.168.1.100`).

2. **Connect other devices**:
   - Make sure your mobile phone or secondary laptop is connected to the **same office WiFi network**.
   - Open a browser (Chrome/Safari) on the phone or secondary laptop.
   - Go to: `http://192.168.29.232` (replace with your actual PC IP address).
   - **Do not add port numbers (like :8000 or :5173)**. Simply go to the IP.

3. **Log in**:
   - Enter your credentials (e.g., admin, clerk, or viewer) and press Login.
   - The interface is fully responsive, fitting perfectly on mobile screens.

---

### Temporary Public Access (Ngrok & Localhost.run)

If Anil or his staff need to access the database from outside the office (e.g., from home or a remote construction site) without hosting on a cloud provider, you can create a temporary secure tunnel.

> [!IMPORTANT]
> Because the Nginx entryway acts as a unified portal on **Port 80**, you must tunnel Port 80. Do not tunnel port 8000 or 5173.

#### Option A: Using Ngrok (Recommended)
1. Download [Ngrok for Windows](https://ngrok.com/download) and sign up for a free account.
2. Authenticate your ngrok installation (one-time setup):
   ```powershell
   ngrok config add-authtoken <your-auth-token>
   ```
3. Run the tunnel command:
   ```powershell
   ngrok http 80
   ```
4. Ngrok will display a public URL (e.g., `https://abc123xyz.ngrok-free.app`).
5. Open this URL on your phone or remote computer. It will tunnel directly into the portal.

#### Option B: Using Localhost.run (No Install Needed)
If you have SSH installed on your Windows computer (available by default on Windows 10/11):
1. Open **PowerShell**.
2. Run this command:
   ```powershell
   ssh -R 80:localhost:80 nokey@localhost.run
   ```
3. The terminal will print a public web address (e.g., `https://octs-portal.lhr.life`).
4. Share this link with anyone who needs to access the site. Press `Ctrl + C` in PowerShell to stop the public link.

---

## 17. Data Backup & Recovery

### 🔵 What Needs to Be Backed Up

1. **The database** (all employee records, users, audit logs).
2. **Uploaded files** (CVs, passports, certificates stored in `backend/employee_docs/`).

### 📦 Backing Up the Database

Run this command in PowerShell:

```powershell
cd C:\Users\abhay\Desktop\OCTS
docker exec -t octs-postgres_db-1 pg_dump -U octs_user octs_db > octs_backup_$(Get-Date -Format 'yyyy-MM-dd').sql
```

This creates a file like `octs_backup_2026-06-14.sql` in the OCTS folder. Copy this to a USB drive or external hard disk.

### 📁 Backing Up Uploaded Files

Simply copy the entire folder:
```
C:\Users\abhay\Desktop\OCTS\backend\employee_docs\
```
to your backup drive. This folder contains all employee documents.

### ♻️ Restoring from Backup

If something goes wrong:

1. Place your SQL backup file in the OCTS folder and rename it to `restore_backup.sql`.
2. Run this command in PowerShell:
   ```powershell
   cd C:\Users\abhay\Desktop\OCTS
   cat restore_backup.sql | docker exec -i octs-postgres_db-1 psql -U octs_user -d octs_db
   ```
3. Copy the backed-up `employee_docs` folder back to `C:\Users\abhay\Desktop\OCTS\backend\employee_docs\`.

---

## 18. Troubleshooting Common Problems

### ❌ Website not loading (http://localhost shows nothing)
- **Check if Docker is running:** Look for the whale icon in the system tray.
- Open PowerShell and type:
  ```powershell
  docker compose ps
  ```
  All three services should show `Up`. If not, run:
  ```powershell
  cd C:\Users\abhay\Desktop\OCTS
  docker compose up -d
  ```

### ❌ "Invalid credentials" or login failing on phone
- Ensure you are logging in with the correct credentials.
- Ensure you accessed `http://<IP-address>` and **not** `http://<IP-address>:8000` or `http://<IP-address>:5173`. Port 80 must be used.
- Make sure both the computer and phone are on the exact same WiFi network.

### ❌ Can't upload documents — "File too large"
The file size limit is **20 MB**. Compress the PDF or image before uploading.

### ❌ Error Logs (for technical support)
If a bug occurs, fetch the backend logs to send to your developer:
```powershell
cd C:\Users\abhay\Desktop\OCTS
docker compose logs octs_backend --tail=50
```

---

## 19. Security Best Practices

1. **Change the Default Admin Password:** Go to Profile settings immediately after first launch.
2. **Personal Accounts:** Give each staff member their own Clerk or Viewer account. Do not share credentials.
3. **Deactivate Terminated Staff:** Immediately switch user accounts of departed employees to "Inactive".
4. **Secure Backups:** Store your SQL backups off the main host computer (e.g. cloud storage or external drives).

---

## 20. Important Credentials & Settings

### Application Access
- **Portal URL (local):** `http://localhost`
- **Admin Username:** `admin`
- **Default Admin Password:** `Admin@OCTS#2020` (Change Immediately)
- **API Documentation:** `http://localhost:8000/docs`

### Database Connection
- **Database Name:** `octs_db`
- **DB Username:** `octs_user`
- **DB Password:** `octs_password_123`
- **DB Port:** `5432`

### File Locations
- **Project Root:** `C:\Users\abhay\Desktop\OCTS`
- **Uploaded Documents:** `C:\Users\abhay\Desktop\OCTS\backend\employee_docs\`
- **Application Config:** `C:\Users\abhay\Desktop\OCTS\docker-compose.yml`
- **Backend Config:** `C:\Users\abhay\Desktop\OCTS\backend\.env`

---

## 📞 Quick Reference Card

```
┌──────────────────────────────────────────────────────────┐
│           OCTS Portal — Quick Reference                  │
├──────────────────────────────────────────────────────────┤
│  Access:    http://localhost (or server IP on network)  │
│  Admin:     username: admin                              │
│  Start:     docker compose up -d                         │
│  Stop:      docker compose down                          │
│  Status:    docker compose ps                            │
│  Backup:    docker exec -t octs-postgres_db-1 pg_dump   │
│             -U octs_user octs_db > backup.sql            │
│  Logs:      docker compose logs octs_backend             │
│  API Docs:  http://localhost:8000/docs                   │
│  Docs Dir:  C:\Users\abhay\Desktop\OCTS\backend\        │
│             employee_docs\                               │
└──────────────────────────────────────────────────────────┘
```
