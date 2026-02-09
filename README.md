# Oracle SQL 10g Auth Project

This project is split into a **Frontend** (Next.js) and a **Backend** (Express + Oracle).

## Folder Structure
- `/frontend`: Next.js application with Tailwind CSS.
- `/backend`: Node.js/Express server connecting to Oracle 10g.

## Setup Instructions

### 1. Database Setup
- Open `/backend/schema.sql` and run the script in your Oracle SQL command line.
- Copy `/backend/.env.example` to `/backend/.env` and fill in your Oracle credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Features
- Aesthetic Login & Signup pages.
- Oracle SQL 10g integration using `oracledb` thick mode.
- JWT authentication.
- Secure password hashing with `bcryptjs`.
