/* middleware/auth.js */
const jwt  = require('jsonwebtoken');
const { Counsellor, Student } = require('../models');

/* ── Verify JWT from cookie or Authorization header ── */
function verifyToken(req) {
  const fromCookie = req.cookies && req.cookies.et_token;
  const fromHeader = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  return fromCookie || fromHeader || null;
}

/* ── Counsellor/Admin auth ── */
exports.requireAdmin = async (req, res, next) => {
  try {
    const token = verifyToken(req);
    if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'counsellor') return res.status(403).json({ ok: false, msg: 'Not authorized' });
    const c = decoded.role === 'super'
      ? { _id: 'super', id: 'super', name: 'Super Admin', email: process.env.SUPER_ADMIN_EMAIL, role: 'super' }
      : await Counsellor.findById(decoded.id).select('-password -otp');
    if (!c || c.active === false) return res.status(403).json({ ok: false, msg: 'Account inactive or not found' });
    req.admin = c;
    req.adminId = String(c._id || c.id);
    next();
  } catch(e) {
    res.status(401).json({ ok: false, msg: 'Invalid or expired session. Please login again.' });
  }
};

/* ── Super admin only ── */
exports.requireSuper = async (req, res, next) => {
  try {
    const token = verifyToken(req);
    if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'counsellor' || decoded.role !== 'super')
      return res.status(403).json({ ok: false, msg: 'Super admin access required' });
    req.admin = { id: 'super', name: 'Super Admin', email: process.env.SUPER_ADMIN_EMAIL, role: 'super' };
    next();
  } catch(e) {
    res.status(401).json({ ok: false, msg: 'Invalid session' });
  }
};

/* ── Student auth ── */
exports.requireStudent = async (req, res, next) => {
  try {
    const token = verifyToken(req);
    if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'student') return res.status(403).json({ ok: false, msg: 'Not authorized' });
    const s = await Student.findById(decoded.id).select('-otp');
    if (!s) return res.status(404).json({ ok: false, msg: 'Student not found' });
    req.student = s;
    next();
  } catch(e) {
    res.status(401).json({ ok: false, msg: 'Invalid or expired session' });
  }
};

/* ── Either (admin or student) ── */
exports.requireAuth = async (req, res, next) => {
  try {
    const token = verifyToken(req);
    if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenData = decoded;
    next();
  } catch(e) {
    res.status(401).json({ ok: false, msg: 'Invalid session' });
  }
};
