# OCTS Application - Handover & Operations Guide

Welcome to the **Oceanic Construction and Technical Services (OCTS)** internal web application! This guide provides everything your IT administrator needs to securely host, scale, and maintain the system in a production environment.

## 🚀 1. Production Architecture Overview

The system is containerized using **Docker** for maximum reliability and ease of deployment. It consists of three tightly integrated services:
1. **Frontend (Nginx)**: Serves the compiled React user interface lightning-fast on port `80`.
2. **Backend (Gunicorn/FastAPI)**: Handles all business logic, Excel generation, and rate-limited authentication on port `8000`.
3. **Database (PostgreSQL 15)**: The robust relational database ensuring zero data corruption and high scalability.

---

## 🛠️ 2. Starting the Application

To launch the entire platform on a production server (Ubuntu/Windows/Mac), ensure [Docker Desktop](https://www.docker.com/products/docker-desktop) or Docker Engine is installed.

1. Open a terminal and navigate to the root directory (where `docker-compose.yml` is located).
2. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
3. Wait about 60 seconds for the database to initialize and the frontend to compile. 
4. The app is now live! Access it by visiting `http://localhost` (or your server's IP address) in any browser.

---

## 🔐 3. Security & First Steps

> [!IMPORTANT]  
> The system comes with default demo credentials. You MUST change the administrator password immediately upon logging in!

**Default Credentials:**
- **Username:** `admin`
- **Password:** `Admin@OCTS#2020`

### How to manage users:
1. Log in as the `admin`.
2. Navigate to **User Management** via the sidebar.
3. Add actual company staff members, assigning them `Clerk` or `User` (Viewer) roles.
4. Go to your own profile settings and change the admin password.

---

## 💾 4. Database Backups & Data Management

Your database data and uploaded documents (CVs, Passports) are safely stored in Docker "volumes" and local folders.

### Uploaded Files (CVs, Medical Docs)
All uploaded employee documents are stored securely in the `backend/uploads/` folder.
* **To backup:** Simply copy the `backend/uploads/` folder to a secure backup drive periodically.

### PostgreSQL Database Backup
To extract a complete backup of the database:
```bash
docker exec -t octs-postgres_db-1 pg_dump -U octs_user octs_db > octs_database_backup.sql
```

### Restoring the Database
If you ever need to restore from a backup:
```bash
cat octs_database_backup.sql | docker exec -i octs-postgres_db-1 psql -U octs_user -d octs_db
```

---

## 🛡️ 5. Built-in Safeguards

We have implemented several enterprise-grade safeguards:
1. **Rate Limiting**: To prevent hackers from brute-forcing passwords, the login endpoint allows a maximum of 5 attempts per minute per IP address.
2. **Audit Logging**: Every edit, deletion, or creation of an employee record is permanently logged. The Admin can view these under the "Audit Logs" tab.
3. **Log Rotation**: Technical API logs are written to `backend/logs/octs_api.log`. The system automatically caps these logs at 5MB, preventing them from eating up server hard drive space over time.

---

## 📞 6. Troubleshooting

**The Website isn't loading:**
Run `docker-compose ps` to ensure all three containers (frontend, backend, database) have a status of `Up`.

**Checking Error Logs:**
If something goes wrong, you can inspect the backend logs:
```bash
docker-compose logs -f octs_backend
```

**Restarting the Server:**
If you make changes or need a hard reset:
```bash
docker-compose down
docker-compose up -d
```
