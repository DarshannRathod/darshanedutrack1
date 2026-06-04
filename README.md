# EduTrack Education Solution — Node.js + MongoDB

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and set:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — your admin credentials
- `SMTP_USER` / `SMTP_PASS` — Gmail app password for OTP emails

### 3. Start MongoDB
```bash
# Local MongoDB
mongod --dbpath /data/db

# OR use MongoDB Atlas (cloud) — paste the connection string in .env
```

### 4. Start Server
```bash
npm start          # production
npm run dev        # development (auto-restart)
```

### 5. Open Browser
- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html
- **Student Login:** http://localhost:3000/login.html

---

## 🔑 Default Login
| Role | Email | Password |
|------|-------|----------|
| Super Admin | edutracksolution@gmail.com | EduTrack@2026 |

---

## 📧 Email (OTP) Setup
1. Go to your Gmail → Google Account → Security → App Passwords
2. Create an App Password for "Mail"
3. Set in `.env`:
   ```
   SMTP_USER=edutracksolution@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

---

## 🌐 Deploy to Production (Render.com — Free)
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Set environment variables from `.env`
5. Build Command: `npm install`
6. Start Command: `node server/index.js`
7. Use MongoDB Atlas for the database

---

## 🏗️ Architecture
```
edutrack_node/
├── server/
│   └── index.js          # Express app + MongoDB connection
├── models/
│   └── index.js          # Mongoose schemas (Counsellor, Student, Log, Settings)
├── routes/
│   └── index.js          # All API routes (/api/*)
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── utils/
│   └── index.js          # Logger, OTP, email sender, JWT helper
├── public/               # All static HTML/CSS/JS files
│   ├── js/
│   │   ├── api.js        # Frontend API client (replaces localStorage)
│   │   ├── admin-app.js  # Admin panel application
│   │   ├── login-app.js  # Student login/register
│   │   └── dashboard-app.js # Student dashboard
│   ├── css/style.css
│   ├── admin.html
│   ├── login.html
│   ├── dashboard.html
│   └── [all other pages]
├── package.json
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

### Auth — Admin/Counsellor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/admin/send-otp | Send OTP to counsellor email |
| POST | /api/auth/admin/verify-otp | Verify OTP and login |
| POST | /api/auth/admin/password | Login with password |
| POST | /api/auth/admin/logout | Logout |
| GET  | /api/auth/admin/me | Get current admin info |

### Auth — Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/student/register | Register new student |
| POST | /api/auth/student/send-otp | Send login OTP |
| POST | /api/auth/student/verify-otp | Verify OTP and login |
| POST | /api/auth/student/logout | Logout |
| GET  | /api/auth/student/me | Get current student |

### Students (Admin/Counsellor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List all students (filterable) |
| GET | /api/students/:id | Get one student |
| PUT | /api/students/:id | Update student details |
| DELETE | /api/students/:id | Delete student |
| PUT | /api/students/:id/choicelist | Set choice list |

### Student Self-Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/student/profile | Get own profile |
| PUT | /api/student/profile | Update own profile |
| PUT | /api/student/saved | Save/update saved colleges |

### Counsellors (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/counsellors | List all counsellors |
| POST | /api/counsellors | Create counsellor |
| PUT | /api/counsellors/:id | Update counsellor |
| DELETE | /api/counsellors/:id | Delete counsellor |

### Logs & Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/logs | Get activity logs (filterable) |
| GET | /api/logs/student/:id | Logs for one student |
| DELETE | /api/logs | Clear all logs |
| GET | /api/settings | Get settings |
| PUT | /api/settings | Save settings |
| GET | /api/stats | Dashboard stats |
