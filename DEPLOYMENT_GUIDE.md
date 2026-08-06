# 🚀 OCTS Offshore Manpower Portal — 24/7 Vercel & GitHub Deployment Guide

This guide details how to host the **OCTS Employee Management Portal** live on **Vercel** with a free **Neon.tech PostgreSQL** cloud database and automatic **GitHub CI/CD deployments**.

---

## 🏗️ Architecture Overview

* **Frontend**: React 18 + Vite (compiled & served worldwide via Vercel Edge CDN).
* **Backend**: FastAPI (Python serverless function running via `/api` route on Vercel).
* **Database**: Serverless PostgreSQL (Hosted on Neon.tech or Supabase).
* **Document Persistence**: Uploaded PDFs, photos, and certificates are saved directly into PostgreSQL (`employee_documents` table) so files persist 24/7 across all Vercel serverless executions.
* **Auto-Deployments**: Whenever you push changes to your GitHub repository, Vercel automatically builds and updates your live site!

---

## 🗄️ Step 1: Create a Free PostgreSQL Database (Neon.tech)

1. Go to [https://neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project**, name it `octs-manpower-db`, and choose a region close to you.
3. Once created, copy your **PostgreSQL Connection String** (it looks like this):
   ```text
   postgres://alex:Password123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this URL — you will add it as `DATABASE_URL` in Vercel.

---

## 🐙 Step 2: Push Your Project to GitHub

1. Open your terminal in the `OCTS` project folder.
2. Initialize Git and commit the project:
   ```bash
   git init
   git add .
   git commit -m "Initial production commit for OCTS Manpower portal"
   ```
3. Go to [https://github.com/new](https://github.com/new) and create a repository named `OCTS-Manpower-Portal`.
4. Link and push your project to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/OCTS-Manpower-Portal.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Step 3: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **Add New...** -> **Project**.
3. Select your `OCTS-Manpower-Portal` GitHub repository and click **Import**.
4. In the Project Setup screen, expand **Environment Variables** and add the following:

   | Name | Value | Example |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | Your Neon Postgres Connection String | `postgres://...` |
   | `SECRET_KEY` | A random 64-character secret key | `super-secret-key-1234567890-octs-production` |
   | `VITE_API_BASE_URL` | `/api` | `/api` |

5. Click **Deploy**.
6. Vercel will automatically build the frontend, package the Python backend serverless function, run initial database table migrations, and give you a live **URL** (e.g., `https://octs-manpower-portal.vercel.app`)!

---

## 🔒 Step 4: Login & Default Credentials

After initial database setup, log in with default credentials:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@OCTS#2020` |
| **Clerk** | `clerk1` | `Clerk@OCTS#2020` |
| **Viewer** | `viewer1` | `User@OCTS#2020` |

> [!IMPORTANT]
> Change the default passwords immediately from the **Profile** / **User Management** page!

---

## 🛠️ Step 5: How Remote Updates & Debugging Work

Whenever you want to fix a bug, add a feature, or edit styling:
1. Make your code edit in this project locally.
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update employee form validation"
   git push
   ```
3. Vercel automatically detects the push and redeploys your live website within 30-60 seconds!

---

## 📊 Summary of Production Features

* ✅ **55+ Employee Fields** (Personal, Passport, CDC/NED, Certifications, Deployment, Bank details, PPE, Project assignments).
* ✅ **Document Management** (PDF, Photo, Passport, Medical, BOSIET upload & download with DB persistence).
* ✅ **Role-Based Access Control** (Admin, Clerk, Viewer with salary protection & limited fields for Viewers).
* ✅ **Excel Export** (One-click master sheet export).
* ✅ **Audit Trail** (Full logging of creates, edits, downloads, and deletes).
* ✅ **100% Mobile & Desktop Responsive Layout**.
