# PopulousHR — Online Course Enrollment

## Deployment Guide

The project has two parts deployed separately:
- **Backend (API)** → [Railway](https://railway.app) — free tier available
- **Frontend (React)** → [Vercel](https://vercel.com) — free tier available
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com) — free 512MB cluster

---

## Step 1 — Push to GitHub

You must have your code on GitHub first.

```bash
# From the project root
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2 — Set up MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and sign up / log in
2. Click **Create a deployment** → choose **M0 Free**
3. Choose a cloud provider (AWS) and region closest to you
4. Set a **username** and **password** — save these
5. Under **Network Access** → click **Add IP Address** → choose **Allow access from anywhere** (0.0.0.0/0)
6. Go to **Database** → click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with what you set. Add your database name:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/online_course_enrollment?retryWrites=true&w=majority
```

---

## Step 3 — Deploy Backend to Railway

1. Go to https://railway.app and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will detect the project — click **Add service** if needed
5. Set the **Root Directory** to `backend`
6. Go to the service → **Variables** tab → add these environment variables:

```
MONGODB_URI     = mongodb+srv://... (your Atlas connection string)
JWT_SECRET      = any_long_random_string_min_32_chars
ADMIN_SECRET    = your_admin_secret_key
NODE_ENV        = production
CLIENT_ORIGIN   = https://your-app.vercel.app
```

> Leave `PORT` empty — Railway sets it automatically.

7. Click **Deploy** — wait for the build to finish
8. Go to **Settings** → **Networking** → **Generate Domain**
9. Copy your Railway URL, e.g. `https://populoushr-api.up.railway.app`

### Seed the database on Railway

After deploying, open the Railway service → **Shell** tab and run:
```bash
node scripts/seed.js
```

---

## Step 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New Project** → import your repository
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Vite`
5. Under **Environment Variables** add:

```
VITE_API_URL = https://populoushr-api.up.railway.app
```

(Use your actual Railway URL from Step 3)

6. Click **Deploy** — Vercel builds and gives you a URL like `https://your-app.vercel.app`

---

## Step 5 — Update CORS on Railway

Now that you have your Vercel URL, go back to Railway → Variables and update:

```
CLIENT_ORIGIN = https://your-app.vercel.app
```

Then redeploy the backend (Railway does this automatically when you save variables).

---

## Step 6 — Verify Everything Works

1. Open your Vercel URL in the browser
2. Register a new account (student)
3. Register another account with the admin secret to get admin access
4. Log in as admin → verify the dashboard shows courses and users
5. Log in as student → enroll in a course → complete lessons → earn a certificate

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev        # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev        # runs on http://localhost:5173

# Seed the database (first time only)
cd backend
node scripts/seed.js

# Promote a user to admin by email
node scripts/makeAdmin.js their@email.com
```

### Local environment files

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/online_course_enrollment2
JWT_SECRET=dev_secret_change_me
ADMIN_SECRET=populous_admin_2025
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## Architecture

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Auth**: JWT stored in HttpOnly cookie
- **Deployment**: Railway (API) + Vercel (React) + MongoDB Atlas (DB)
