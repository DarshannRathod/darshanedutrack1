# EduTrack — Complete Setup Guide

## 🚀 Start in 3 Steps

### Step 1 — Install packages
```
npm install
```

### Step 2 — Configure
Edit `.env` file. Minimum required:
```
MONGO_URI=mongodb://localhost:27017/edutrack
JWT_SECRET=any_long_random_string_here_change_this
SUPER_ADMIN_EMAIL=edutracksolution@gmail.com
SUPER_ADMIN_PASSWORD=EduTrack@2026
```

### Step 3 — Run
```
npm start
```
Open: **http://localhost:3000**

---

## 📧 Gmail OTP Setup (5 min)
1. Google Account → Security → 2-Step Verification (enable)
2. Google Account → Security → App Passwords → Create → Copy 16-char password
3. In `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=edutracksolution@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

---

## 🌐 Free Cloud Hosting (Render.com)

### MongoDB Atlas (free cloud database)
1. mongodb.com/cloud/atlas → Free cluster → Connect → Copy URI
2. In `.env`: `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/edutrack`

### Render.com (free web hosting)
1. Push code to GitHub
2. render.com → New Web Service → Connect repo
3. Build: `npm install` | Start: `node server/index.js`
4. Add Environment Variables (copy from .env)
5. Your site: `https://your-app.onrender.com`

---

## 🔑 Default Admin Login
| Email | Password |
|-------|----------|
| edutracksolution@gmail.com | EduTrack@2026 |

Login at: `http://localhost:3000/admin.html`

---

## 📱 Multi-User — How it Works
- All data stored in **MongoDB** — same database for everyone
- **Admin/Counsellors** login at `/admin.html`
- **Students** login at `/login.html`
- Sessions use **JWT cookies** — work across tabs, browsers, devices
- Multiple counsellors can use the system simultaneously
- Real-time: student updates visible to all admins instantly

---

## 🗂️ File Structure
```
edutrack_node/
├── server/index.js       ← Express + MongoDB server
├── models/index.js       ← Database schemas
├── routes/index.js       ← All API endpoints (/api/*)
├── middleware/auth.js    ← JWT authentication
├── utils/index.js        ← Email OTP, logging, JWT
├── public/               ← All website files
│   ├── admin.html        ← Admin/Counsellor panel
│   ├── login.html        ← Student login/register
│   ├── dashboard.html    ← Student dashboard
│   ├── index.html        ← Public homepage
│   ├── js/
│   │   ├── api.js        ← Frontend API client
│   │   ├── admin-app.js  ← Admin panel logic
│   │   ├── login-app.js  ← Login/register logic
│   │   └── dashboard-app.js ← Student dashboard
│   └── css/style.css
├── .env                  ← Your configuration (EDIT THIS)
├── .env.example          ← Config template
└── package.json
```
