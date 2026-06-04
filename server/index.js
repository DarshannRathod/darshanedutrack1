/* server/index.js — EduTrack Node.js Server */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express    = require('express');
const mongoose   = require('mongoose');
const path       = require('path');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const rateLimit  = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser  = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Security Middleware ── */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

/* ── Rate Limiting ── */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { ok: false, msg: 'Too many attempts. Try again in 15 minutes.' } });
const apiLimiter  = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

/* ── Serve static frontend files ── */
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

/* ── API Routes ── */
app.use('/api', require('../routes'));

/* ── Serve HTML pages ── */
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));

/* ── SPA fallback — serve index.html for unknown routes ── */
app.get('*', (req, res) => {
  const htmlFile = path.join(__dirname, '../public', req.path.replace(/^\//, '') + '.html');
  const fs = require('fs');
  if (fs.existsSync(htmlFile)) return res.sendFile(htmlFile);
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/* ── MongoDB + Start ── */
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);
    await seedSuperAdmin();
    app.listen(PORT, () => {
      console.log(`\n🚀 EduTrack server running at http://localhost:${PORT}`);
      console.log(`📊 Admin panel: http://localhost:${PORT}/admin.html`);
      console.log(`👤 Student login: http://localhost:${PORT}/login.html`);
      console.log(`🔑 Super Admin: ${process.env.SUPER_ADMIN_EMAIL} / ${process.env.SUPER_ADMIN_PASSWORD}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Make sure MongoDB is running: mongod --dbpath /data/db');
    process.exit(1);
  });

/* ── Auto-create Super Admin on first run ── */
async function seedSuperAdmin() {
  try {
    const { Settings } = require('../models');
    const exists = await Settings.findOne({ key: 'seeded' });
    if (exists) return;
    await Settings.create({ key: 'seeded', value: true });
    console.log('✅ Database seeded — Super Admin ready');
  } catch(e) { /* ignore */ }
}

module.exports = app;
