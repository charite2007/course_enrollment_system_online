# Project Architecture — PopulousHR (Online Course Enrollment)

## Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose) — runs on `http://localhost:PORT`
- **Frontend**: React (Vite) + Axios — runs on `http://localhost:5173`
- **Auth**: JWT stored in HttpOnly cookie (backend) + user object in localStorage (frontend)

---

## Backend File Flow

```
server.js
│
├── database/db.js              ← connects to MongoDB via MONGODB_URI
│
├── middleware/
│   ├── authorMiddleware.js     ← protection() reads JWT cookie → attaches req.user
│   │                              adminOnly() checks req.user.role === "admin"
│   └── validationMiddleware.js ← registerValidation / loginValidation (express-validator rules)
│
├── models/                     ← Mongoose schemas (MongoDB collections)
│   ├── author.js               → User  { Fullname, email, password, role, phone, bio, photo }
│   ├── course.js               → Course { title, description, instructor, category, level, price, ... }
│   ├── lesson.js               → Lesson { courseId→Course, title, videoUrl, order, ... }
│   ├── enrollment.js           → Enrollment { studentId→User, courseId→Course, completedLessons, progress }
│   └── certificate.js          → Certificate { studentId→User, courseId→Course, issuedAt }
│
├── controllers/                ← business logic, uses models, sends JSON responses
│   ├── authorController.js     → register(), login(), logout()
│   ├── courseController.js     → getCourses(), getCourse(), createCourse(), updateCourse(),
│   │                              deleteCourse(), addLesson(), updateLesson(), deleteLesson()
│   ├── enrollmentController.js → enrollCourse(), getMyEnrollments(), completeLesson(),
│   │                              getMyCertificates(), getAllEnrollments()
│   └── userController.js       → getProfile(), updateProfile(), updatePassword(),
│                                  getAllUsers(), deleteUser(), getAdminStats(), getStudentStats()
│
└── router/                     ← maps HTTP routes → middleware → controllers
    ├── authorRouter.js         POST /api/auth/register  → registerValidation → register
    │                           POST /api/auth/login     → loginValidation    → login
    │                           POST /api/auth/logout    → logout
    │
    ├── userRouter.js           GET  /api/users/profile        → protection → getProfile
    │                           PUT  /api/users/profile        → protection → updateProfile
    │                           PUT  /api/users/password       → protection → updatePassword
    │                           GET  /api/users/stats/student  → protection → getStudentStats
    │                           GET  /api/users/stats/admin    → protection, adminOnly → getAdminStats
    │                           GET  /api/users/all            → protection, adminOnly → getAllUsers
    │                           DELETE /api/users/:id          → protection, adminOnly → deleteUser
    │
    ├── courseRouter.js         GET  /api/courses               → protection → getCourses
    │                           GET  /api/courses/:id           → protection → getCourse
    │                           POST /api/courses               → protection, adminOnly → createCourse
    │                           PUT  /api/courses/:id           → protection, adminOnly → updateCourse
    │                           DELETE /api/courses/:id         → protection, adminOnly → deleteCourse
    │                           POST /api/courses/:id/lessons   → protection, adminOnly → addLesson
    │                           PUT  /api/courses/:id/lessons/:lessonId → adminOnly → updateLesson
    │                           DELETE /api/courses/:id/lessons/:lessonId → adminOnly → deleteLesson
    │
    └── enrollmentRouter.js     GET  /api/enrollments/my           → protection → getMyEnrollments
                                GET  /api/enrollments/certificates  → protection → getMyCertificates
                                GET  /api/enrollments/all           → protection, adminOnly → getAllEnrollments
                                POST /api/enrollments/:courseId     → protection → enrollCourse
                                PUT  /api/enrollments/:courseId/lesson → protection → completeLesson
```

---

## Frontend File Flow

```
index.html
└── main.jsx                    ← mounts <App /> into #root
    └── App.jsx                 ← wraps everything in <AuthProvider> + <BrowserRouter>
        │
        ├── context/AuthContext.jsx
        │   └── AuthProvider    ← holds user state (from localStorage via auth.getUser())
        │       ├── login()     → calls auth.login() → sets user state
        │       └── logout()    → calls auth.logout() → clears user state
        │
        ├── components/
        │   ├── ProtectedRoute.jsx  ← reads useAuth().user; redirects to /login if not logged in
        │   │                          redirects to /dashboard if wrong role
        │   ├── Layout.jsx          ← wraps page content with <Sidebar />
        │   └── Sidebar.jsx         ← navigation links, reads user role for admin links
        │
        ├── api/api.js              ← single Axios instance (baseURL = VITE_API_URL)
        │   ├── auth.*              → /api/auth/*
        │   ├── users.*             → /api/users/*
        │   ├── courses.*           → /api/courses/*
        │   └── enrollments.*       → /api/enrollments/*
        │   (interceptor: 401 → redirect to /login)
        │
        └── pages/                  ← each page imports from api/api.js and uses useAuth()
            │
            ├── Login.jsx           → auth.login()
            ├── Register.jsx        → auth.register()
            │
            ├── Dashboard.jsx       → routes to StudentDashboard or AdminDashboard by role
            ├── StudentDashboard.jsx → users.getStudentStats(), enrollments.getMy()
            ├── AdminDashboard.jsx   → users.getAdminStats()
            │
            ├── FindCourses.jsx      → courses.getAll()
            ├── CourseDetails.jsx    → courses.getOne(id), enrollments.enroll(id)
            ├── MyCourses.jsx        → enrollments.getMy()
            ├── LessonView.jsx       → courses.getOne(id), enrollments.completeLesson()
            ├── EnrollmentConfirmation.jsx → courses.getOne(id)
            ├── Certificates.jsx     → enrollments.getCertificates()
            │
            ├── Settings.jsx         → users.getProfile(), users.updateProfile(),
            │                          users.updatePassword()
            │
            ├── AdminCourses.jsx     → courses.getAll(), courses.create(), courses.update(),
            │                          courses.delete(), courses.addLesson(),
            │                          courses.updateLesson(), courses.deleteLesson()
            ├── AdminUsers.jsx       → users.getAll(), users.deleteUser()
            ├── AdminEnrollments.jsx → enrollments.getAll()
            │
            └── Placeholder.jsx     ← stub for HR pages (My Applications, Interview, etc.)
```

---

## Request Lifecycle (example: student completes a lesson)

```
LessonView.jsx
  → enrollments.completeLesson(courseId, lessonId)       [api/api.js]
    → PUT /api/enrollments/:courseId/lesson              [HTTP + cookie]
      → protection middleware (authorMiddleware.js)      [verifies JWT]
        → completeLesson controller (enrollmentController.js)
          → Enrollment.findOne() + push lessonId
          → Lesson.countDocuments() → recalculate progress
          → if 100%: Certificate.create()
          → enrollment.save()
          → res.json(enrollment)
  ← updated enrollment object returned to LessonView.jsx
```

---

## Model Relationships

```
User ──────────────────────────────────────────────────────┐
  │                                                         │
  │ createdBy                                               │
  ▼                                                         │
Course ──────────────────────────────────────────────────┐  │
  │                                                       │  │
  │ courseId                                              │  │
  ▼                                                       │  │
Lesson                                                    │  │
                                                          │  │
Enrollment { studentId → User, courseId → Course }  ◄────┘  │
Certificate { studentId → User, courseId → Course } ◄───────┘
```
