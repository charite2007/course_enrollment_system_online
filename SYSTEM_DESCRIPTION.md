# PopulousHR — Online Course Enrollment System
## Complete System Description

---

## 1. Overview

PopulousHR is a full-stack online course enrollment platform that allows students to discover, enroll in, and complete courses, while administrators manage the entire learning ecosystem. The system issues digital certificates upon course completion and provides real-time progress tracking for both students and admins.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│         React 19 + Vite + Tailwind CSS v4                │
│         Framer Motion · React Router v7 · Axios          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (REST API)
                         │ JWT via HttpOnly Cookie
┌────────────────────────▼────────────────────────────────┐
│                  BACKEND (Node.js)                        │
│         Express 5 · Mongoose · bcryptjs · JWT            │
│         express-validator · cookie-parser · cors         │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                  DATABASE (MongoDB)                       │
│         Collections: authors, courses, lessons,          │
│         enrollments, certificates                        │
└─────────────────────────────────────────────────────────┘
```

**Deployment:**
- Frontend → Vercel (static hosting, CDN)
- Backend  → Render or Railway (Node.js server)
- Database → MongoDB Atlas (M0 free cluster)

---

## 3. Technology Stack

| Layer      | Technology              | Version  | Purpose                          |
|------------|-------------------------|----------|----------------------------------|
| Frontend   | React                   | 19.x     | UI component framework           |
| Frontend   | Vite                    | 8.x      | Build tool & dev server          |
| Frontend   | Tailwind CSS            | 4.x      | Utility-first styling            |
| Frontend   | Framer Motion           | 12.x     | Animations & transitions         |
| Frontend   | React Router DOM        | 7.x      | Client-side routing              |
| Frontend   | Axios                   | 1.x      | HTTP client with interceptors    |
| Backend    | Node.js                 | 18+      | JavaScript runtime               |
| Backend    | Express                 | 5.x      | HTTP server framework            |
| Backend    | Mongoose                | 9.x      | MongoDB ODM                      |
| Backend    | bcryptjs                | 3.x      | Password hashing                 |
| Backend    | jsonwebtoken            | 9.x      | JWT generation & verification    |
| Backend    | express-validator       | 7.x      | Request validation               |
| Backend    | cookie-parser           | 1.x      | HttpOnly cookie parsing          |
| Backend    | cors                    | 2.x      | Cross-origin resource sharing    |
| Database   | MongoDB Atlas           | 7.x      | NoSQL document database          |

---

## 4. Database Schema

### Author (User)
```
{
  Fullname : String  (required)
  email    : String  (required, unique, lowercase)
  password : String  (required, bcrypt hashed)
  role     : String  (enum: "student" | "admin", default: "student")
  phone    : String  (optional)
  bio      : String  (optional)
  photo    : String  (optional, URL)
  createdAt: Date    (auto)
  updatedAt: Date    (auto)
}
```

### Course
```
{
  title        : String  (required)
  description  : String  (required)
  instructor   : String  (required)
  category     : String  (default: "General")
  level        : String  (enum: "Beginner" | "Intermediate" | "Advanced")
  price        : Number  (default: 0)
  thumbnail    : String  (optional, URL)
  durationHours: Number  (default: 0)
  createdAt    : Date    (auto)
  updatedAt    : Date    (auto)
}
```

### Lesson
```
{
  courseId : ObjectId → Course  (required)
  title    : String             (required)
  videoUrl : String             (optional, YouTube embed URL)
  order    : Number             (default: 1)
  createdAt: Date               (auto)
  updatedAt: Date               (auto)
  INDEX: { courseId, order } unique
}
```

### Enrollment
```
{
  studentId       : ObjectId → Author  (required)
  courseId        : ObjectId → Course  (required)
  completedLessons: [ObjectId → Lesson]
  progress        : Number (0–100, auto-calculated)
  createdAt       : Date   (auto)
  updatedAt       : Date   (auto)
  INDEX: { studentId, courseId } unique
}
```

### Certificate
```
{
  studentId: ObjectId → Author  (required)
  courseId : ObjectId → Course  (required)
  issuedAt : Date               (default: now)
  createdAt: Date               (auto)
  updatedAt: Date               (auto)
  INDEX: { studentId, courseId } unique
}
```

---

## 5. API Endpoints

### Authentication  —  /api/auth
| Method | Path        | Auth | Description                        |
|--------|-------------|------|------------------------------------|
| POST   | /register   | ✗    | Register new user (student/admin)  |
| POST   | /login      | ✗    | Login, sets HttpOnly JWT cookie    |
| POST   | /logout     | ✗    | Clears JWT cookie                  |

### Users  —  /api/users
| Method | Path              | Auth         | Description                    |
|--------|-------------------|--------------|--------------------------------|
| GET    | /profile          | Student/Admin| Get own profile                |
| PUT    | /profile          | Student/Admin| Update own profile             |
| PUT    | /password         | Student/Admin| Change own password            |
| GET    | /stats/student    | Student      | Get student dashboard stats    |
| GET    | /stats/admin      | Admin        | Get admin dashboard stats      |
| GET    | /all              | Admin        | List all users                 |
| PUT    | /:id/promote      | Admin        | Toggle user role               |
| DELETE | /:id              | Admin        | Delete user + their data       |

### Courses  —  /api/courses
| Method | Path                      | Auth         | Description              |
|--------|---------------------------|--------------|--------------------------|
| GET    | /                         | Student/Admin| List all courses         |
| GET    | /:id                      | Student/Admin| Get course + lessons     |
| POST   | /                         | Admin        | Create course            |
| PUT    | /:id                      | Admin        | Update course            |
| DELETE | /:id                      | Admin        | Delete course + lessons  |
| POST   | /:id/lessons              | Admin        | Add lesson to course     |
| PUT    | /:id/lessons/:lessonId    | Admin        | Update lesson            |
| DELETE | /:id/lessons/:lessonId    | Admin        | Delete lesson            |

### Enrollments  —  /api/enrollments
| Method | Path                  | Auth         | Description                        |
|--------|-----------------------|--------------|------------------------------------|
| GET    | /my                   | Student      | Get own enrollments (populated)    |
| GET    | /certificates         | Student      | Get own certificates               |
| GET    | /all                  | Admin        | Get all enrollments                |
| POST   | /:courseId            | Student      | Enroll in a course                 |
| PUT    | /:courseId/lesson     | Student      | Mark lesson complete, update %     |
| DELETE | /:courseId            | Student      | Unenroll from a course             |

---

## 6. Authentication & Security

- **JWT** stored in **HttpOnly, Secure, SameSite=None** cookie (production)
- **SameSite=Lax** in development for localhost compatibility
- Token expiry: **7 days**
- Passwords hashed with **bcrypt** (10 salt rounds)
- Admin registration requires a secret key (`ADMIN_SECRET` env var)
- All protected routes use `protection` middleware (JWT verification)
- Admin-only routes additionally use `adminOnly` middleware (role check)
- CORS configured to allow only the `CLIENT_ORIGIN` env var domain
- Request validation via `express-validator` on register/login

---

## 7. Frontend Pages & Routes

### Public Routes
| Path        | Component  | Description                    |
|-------------|------------|--------------------------------|
| /login      | Login      | Email + password sign-in       |
| /register   | Register   | New account creation           |

### Protected Routes (all authenticated users)
| Path                          | Component             | Description                        |
|-------------------------------|-----------------------|------------------------------------|
| /dashboard                    | Dashboard             | Routes to Student or Admin view    |
| /settings                     | Settings              | Profile, theme, password           |
| /find-courses                 | FindCourses           | Browse & enroll in courses         |
| /courses/:id                  | CourseDetails         | Course info + lesson list          |
| /enrollment-confirmation/:id  | EnrollmentConfirmation| Post-enroll success screen         |
| /my-courses                   | MyCourses             | Student's enrolled courses         |
| /lesson/:id                   | LessonView            | Video player + lesson progress     |
| /certificates                 | Certificates          | Earned certificates                |

### Admin-Only Routes
| Path                | Component         | Description                    |
|---------------------|-------------------|--------------------------------|
| /admin/courses      | AdminCourses      | CRUD courses & lessons         |
| /admin/users        | AdminUsers        | Manage users & roles           |
| /admin/enrollments  | AdminEnrollments  | View all enrollments           |

---

## 8. Key Features

### Student Features
- Register and log in securely
- Browse all available courses with search and level filters
- View course details including lesson list and instructor info
- Enroll in courses (free or paid display)
- Watch embedded YouTube lesson videos
- Mark lessons as complete — progress auto-calculates
- Auto-advance to next lesson after completion
- Unenroll from courses they no longer want
- Earn a digital certificate upon 100% course completion
- View all earned certificates with issue date
- Update profile (name, phone, bio, photo URL)
- Change password securely
- Toggle Dark / Light theme (persisted in localStorage)

### Admin Features
- Full admin dashboard with live stats (users, courses, enrollments, certificates)
- Create, edit, and delete courses
- Add, edit, and delete lessons within courses (with YouTube video URL support)
- View all users with search
- Promote/demote users between student and admin roles
- Delete users (cascades to their enrollments and certificates)
- View all enrollments with progress filtering and search
- All student features also available

---

## 9. Frontend State Management

- **AuthContext** — global user state, login/logout/register actions, JWT cookie verification on mount
- **ThemeContext** — dark/light theme toggle, persisted to localStorage, applied via `data-theme` on `<html>`
- **ToastContext** — global notification system (success, error, warning, info), auto-dismiss after 4s
- Local component state via `useState` / `useEffect` for page-level data fetching

---

## 10. Progress Calculation

When a student marks a lesson complete:
1. The lesson ID is added to `completedLessons` array (idempotent — no duplicates)
2. `progress = Math.round((completedLessons.length / totalLessons) * 100)`
3. If `progress === 100`, a Certificate document is created (upsert — no duplicates)
4. The updated enrollment is returned to the frontend immediately

---

## 11. Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<min 32 char random string>
ADMIN_SECRET=<secret key for admin registration>
CLIENT_ORIGIN=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-api.onrender.com
```

---

## 12. Project Structure

```
course_enrollment_system_online/
├── backend/
│   ├── controllers/
│   │   ├── authorController.js     # Auth: register, login, logout
│   │   ├── courseController.js     # Course & lesson CRUD
│   │   ├── enrollmentController.js # Enroll, progress, certificates
│   │   └── userController.js       # Profile, stats, admin user mgmt
│   ├── database/
│   │   └── db.js                   # MongoDB connection
│   ├── middleware/
│   │   ├── authorMiddleware.js     # JWT protection + adminOnly
│   │   └── validationMiddleware.js # express-validator rules
│   ├── models/
│   │   ├── author.js               # User schema
│   │   ├── course.js               # Course schema
│   │   ├── lesson.js               # Lesson schema
│   │   ├── enrollment.js           # Enrollment schema
│   │   └── certificate.js          # Certificate schema
│   ├── router/
│   │   ├── authorRouter.js         # /api/auth routes
│   │   ├── courseRouter.js         # /api/courses routes
│   │   ├── enrollmentRouter.js     # /api/enrollments routes
│   │   └── userRouter.js           # /api/users routes
│   ├── scripts/
│   │   ├── seed.js                 # Seeds 8 courses + admin account
│   │   ├── makeAdmin.js            # Promote user to admin by email
│   │   └── checkUsers.js           # List all users in DB
│   ├── server.js                   # Express app entry point
│   ├── railway.json                # Railway deployment config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              # Axios instance + all API methods
│   │   ├── components/
│   │   │   ├── Layout.jsx          # App shell with sidebar
│   │   │   ├── Sidebar.jsx         # Navigation sidebar (desktop + mobile)
│   │   │   ├── ProtectedRoute.jsx  # Auth + role guard
│   │   │   └── ui.jsx              # Shared UI primitives
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global auth state
│   │   │   ├── ThemeContext.jsx    # Dark/light theme
│   │   │   └── ToastContext.jsx    # Toast notifications
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Routes to student or admin view
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FindCourses.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── EnrollmentConfirmation.jsx
│   │   │   ├── MyCourses.jsx
│   │   │   ├── LessonView.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── admin/
│   │   │       ├── AdminCourses.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminEnrollments.jsx
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx                # React root + providers
│   │   └── index.css               # Global styles + design tokens
│   ├── vercel.json                 # SPA rewrite rule
│   └── package.json
│
├── package.json                    # Root build/start scripts for Railway
└── README.md                       # Deployment guide
```

---

## 13. Seed Data

Running `node scripts/seed.js` creates:

**Admin account:**
- Email: `admin@populoushr.com`
- Password: `Admin123!`

**8 pre-built courses:**
1. Python for Beginners — Zero to Hero (8 lessons, Free)
2. Full-Stack Web Development Bootcamp (8 lessons, $49)
3. UI/UX Design Masterclass (7 lessons, $29)
4. Data Science with Python & Pandas (7 lessons, $59)
5. AWS Cloud Practitioner Essentials (7 lessons, $39)
6. Digital Marketing & SEO Fundamentals (6 lessons, Free)
7. React & TypeScript — Professional Development (7 lessons, $79)
8. Cybersecurity Essentials (7 lessons, $49)

All lessons include real YouTube embed URLs.

---

## 14. Local Development

```bash
# 1. Clone and install
cd backend  && npm install
cd ../frontend && npm install

# 2. Configure environment
# backend/.env  → set MONGODB_URI, JWT_SECRET, ADMIN_SECRET
# frontend/.env → set VITE_API_URL=http://localhost:5000

# 3. Seed the database
cd backend && node scripts/seed.js

# 4. Start both servers
# Terminal 1:
cd backend  && npm run dev   # http://localhost:5000

# Terminal 2:
cd frontend && npm run dev   # http://localhost:5173
```

---

## 15. Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create MongoDB Atlas M0 cluster, whitelist 0.0.0.0/0
- [ ] Deploy backend to Render (root dir: `backend`, start: `node server.js`)
- [ ] Set all backend env vars on Render
- [ ] Deploy frontend to Vercel (root dir: `frontend`, framework: Vite)
- [ ] Set `VITE_API_URL` on Vercel to the Render backend URL
- [ ] Update `CLIENT_ORIGIN` on Render to the Vercel frontend URL
- [ ] Run `node scripts/seed.js` from Render shell
- [ ] Verify `/health` endpoint returns `{"ok":true}`
- [ ] Test register, login, enroll, complete lesson, certificate flow

---

*Generated: PopulousHR Online Course Enrollment System — Full System Description*
