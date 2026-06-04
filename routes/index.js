/* routes/index.js — All EduTrack API routes */
const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const { Counsellor, Student, Log, Settings } = require('../models');
const { requireAdmin, requireSuper, requireStudent, requireAuth } = require('../middleware/auth');
const utils     = require('../utils');

/* ══════════════════════════════════════════════════
   AUTH — COUNSELLOR / ADMIN
══════════════════════════════════════════════════ */

/* POST /api/auth/admin/send-otp */
router.post('/auth/admin/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ ok: false, msg: 'Email required' });
    const em = email.trim().toLowerCase();

    let counsellor;
    if (em === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      counsellor = { name: 'Super Admin', email: em, role: 'super', _id: 'super' };
    } else {
      counsellor = await Counsellor.findOne({ email: em, active: true });
      if (!counsellor) return res.json({ ok: false, msg: 'No active account found for this email.' });
    }

    const otp  = utils.generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (counsellor._id !== 'super') {
      await Counsellor.findByIdAndUpdate(counsellor._id, { otp: { code: otp, expiry } });
    } else {
      /* Store super admin OTP in settings temporarily */
      await Settings.findOneAndUpdate({ key: 'super_otp' }, { key: 'super_otp', value: { code: otp, expiry }, updatedAt: new Date() }, { upsert: true });
    }

    const sent = await utils.sendOTPEmail(em, otp, counsellor.name, 'counsellor');
    res.json({ ok: true, msg: sent ? `OTP sent to ${em}` : `OTP: ${otp} (email not configured — DEMO)`, demo: !sent, otp: sent ? undefined : otp });
  } catch(e) {
    console.error(e);
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/admin/verify-otp */
router.post('/auth/admin/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.json({ ok: false, msg: 'Email and OTP required' });
    const em = email.trim().toLowerCase();

    let counsellor;
    if (em === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      const s = await Settings.findOne({ key: 'super_otp' });
      if (!s || !s.value || s.value.code !== String(otp).trim() || new Date() > new Date(s.value.expiry))
        return res.json({ ok: false, msg: 'Invalid or expired OTP' });
      await Settings.deleteOne({ key: 'super_otp' });
      counsellor = { _id: 'super', id: 'super', name: 'Super Admin', email: em, role: 'super' };
    } else {
      counsellor = await Counsellor.findOne({ email: em, active: true });
      if (!counsellor) return res.json({ ok: false, msg: 'Account not found' });
      if (!counsellor.otp || counsellor.otp.code !== String(otp).trim() || new Date() > counsellor.otp.expiry)
        return res.json({ ok: false, msg: 'Invalid or expired OTP' });
      await Counsellor.findByIdAndUpdate(counsellor._id, { $unset: { otp: 1 } });
    }

    const token = utils.signToken({ id: String(counsellor._id), type: 'counsellor', role: counsellor.role, name: counsellor.name, email: counsellor.email });
    await utils.addLog('counsellor', counsellor.role === 'super' ? 'admin' : 'counsellor', counsellor.name, counsellor._id, 'counsellor', counsellor._id, counsellor.name, 'login', 'OTP login', req.ip);
    res.cookie('et_token', token, utils.cookieOptions()).json({ ok: true, user: { id: String(counsellor._id), name: counsellor.name, email: counsellor.email, role: counsellor.role } });
  } catch(e) {
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/admin/password */
router.post('/auth/admin/password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ ok: false, msg: 'Email and password required' });
    const em = email.trim().toLowerCase();

    let counsellor;
    if (em === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      if (password !== process.env.SUPER_ADMIN_PASSWORD) return res.json({ ok: false, msg: 'Invalid email or password' });
      counsellor = { _id: 'super', id: 'super', name: 'Super Admin', email: em, role: 'super' };
    } else {
      const c = await Counsellor.findOne({ email: em });
      if (!c) return res.json({ ok: false, msg: 'Invalid email or password' });
      if (c.active === false) return res.json({ ok: false, msg: 'Account deactivated. Contact Super Admin.' });
      const match = await c.checkPassword(password);
      if (!match) return res.json({ ok: false, msg: 'Invalid email or password' });
      counsellor = c;
    }

    const token = utils.signToken({ id: String(counsellor._id), type: 'counsellor', role: counsellor.role, name: counsellor.name, email: counsellor.email });
    await utils.addLog('counsellor', counsellor.role === 'super' ? 'admin' : 'counsellor', counsellor.name, counsellor._id, 'counsellor', counsellor._id, counsellor.name, 'login', 'Password login', req.ip);
    res.cookie('et_token', token, utils.cookieOptions()).json({ ok: true, user: { id: String(counsellor._id), name: counsellor.name, email: counsellor.email, role: counsellor.role } });
  } catch(e) {
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/admin/logout */
router.post('/auth/admin/logout', requireAdmin, async (req, res) => {
  await utils.addLog('counsellor', req.admin.role === 'super' ? 'admin' : 'counsellor', req.admin.name, req.adminId, 'counsellor', req.adminId, req.admin.name, 'logout', 'Logged out', req.ip);
  res.clearCookie('et_token').json({ ok: true });
});

/* GET /api/auth/admin/me */
router.get('/auth/admin/me', requireAdmin, (req, res) => {
  const a = req.admin;
  res.json({ ok: true, user: { id: String(a._id || a.id), name: a.name, email: a.email, role: a.role, mobile: a.mobile || '' } });
});

/* ══════════════════════════════════════════════════
   AUTH — STUDENT
══════════════════════════════════════════════════ */

/* POST /api/auth/student/send-otp */
router.post('/auth/student/send-otp', async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile) return res.json({ ok: false, msg: 'Email and mobile required' });
    const s = await Student.findOne({ email: email.trim().toLowerCase(), mobile: mobile.trim() });
    if (!s) return res.json({ ok: false, msg: 'No account found. Please register first.' });

    const otp = utils.generateOTP();
    await Student.findByIdAndUpdate(s._id, { otp: { code: otp, expiry: new Date(Date.now() + 600000) } });
    const sent = await utils.sendOTPEmail(s.email, otp, s.name, 'student');
    res.json({ ok: true, msg: sent ? `OTP sent to ${s.email}` : `OTP: ${otp} (DEMO)`, demo: !sent, otp: sent ? undefined : otp });
  } catch(e) {
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/student/verify-otp */
router.post('/auth/student/verify-otp', async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;
    const s = await Student.findOne({ email: email.trim().toLowerCase(), mobile: mobile.trim() });
    if (!s) return res.json({ ok: false, msg: 'Account not found' });
    if (!s.otp || s.otp.code !== String(otp).trim() || new Date() > s.otp.expiry)
      return res.json({ ok: false, msg: 'Invalid or expired OTP' });
    await Student.findByIdAndUpdate(s._id, { $unset: { otp: 1 } });
    const token = utils.signToken({ id: String(s._id), type: 'student', name: s.name, email: s.email });
    await utils.addLog('student', 'student', s.name, s._id, 'student', s._id, s.name, 'login', 'OTP login', req.ip);
    res.cookie('et_token', token, utils.cookieOptions()).json({ ok: true, student: s.toSafe() });
  } catch(e) {
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/student/register */
router.post('/auth/student/register', async (req, res) => {
  try {
    const { name, email, mobile, city, state, course, year, score, air, category, domicile } = req.body;
    if (!name || !email || !mobile) return res.json({ ok: false, msg: 'Name, email and mobile are required' });
    const em = email.trim().toLowerCase();
    const existing = await Student.findOne({ $or: [{ email: em }, { mobile: mobile.trim() }] });
    if (existing) return res.json({ ok: false, msg: 'Account already exists with this email or mobile. Please login.' });

    const s = await Student.create({ name: name.trim(), email: em, mobile: mobile.trim(), city: city||'', state: state||'', course: course||'MBBS', year: year||'', score: score||'', air: air||'', category: category||'General', domicile: domicile||state||'' });
    const otp = utils.generateOTP();
    await Student.findByIdAndUpdate(s._id, { otp: { code: otp, expiry: new Date(Date.now() + 600000) } });
    const sent = await utils.sendOTPEmail(em, otp, name, 'student');
    await utils.addLog('student', 'student', name, s._id, 'student', s._id, name, 'register', 'New registration', req.ip);
    res.json({ ok: true, msg: sent ? `Verify OTP sent to ${em}` : `OTP: ${otp} (DEMO)`, demo: !sent, otp: sent ? undefined : otp, studentId: String(s._id) });
  } catch(e) {
    if (e.code === 11000) return res.json({ ok: false, msg: 'Email already registered. Please login.' });
    res.json({ ok: false, msg: 'Server error: ' + e.message });
  }
});

/* POST /api/auth/student/logout */
router.post('/auth/student/logout', requireStudent, async (req, res) => {
  await utils.addLog('student', 'student', req.student.name, req.student._id, 'student', req.student._id, req.student.name, 'logout', 'Logged out', req.ip);
  res.clearCookie('et_token').json({ ok: true });
});

/* GET /api/auth/student/me */
router.get('/auth/student/me', requireStudent, (req, res) => {
  res.json({ ok: true, student: req.student.toSafe() });
});

/* ══════════════════════════════════════════════════
   COUNSELLORS (Admin only)
══════════════════════════════════════════════════ */

/* GET /api/counsellors */
router.get('/counsellors', requireAdmin, async (req, res) => {
  try {
    const list = await Counsellor.find().select('-password -otp').sort({ createdAt: -1 });
    res.json({ ok: true, counsellors: list });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* POST /api/counsellors */
router.post('/counsellors', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super') return res.json({ ok: false, msg: 'Only Super Admin can create counsellors' });
    const { name, email, password, role, mobile } = req.body;
    if (!name || !email || !password) return res.json({ ok: false, msg: 'Name, email and password required' });
    const c = await Counsellor.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role: role||'counsellor', mobile: mobile||'' });
    await utils.addLog('counsellor', 'admin', req.admin.name, req.adminId, 'counsellor', c._id, c.name, 'created', 'Created by admin', req.ip);
    res.json({ ok: true, counsellor: c.toSafe() });
  } catch(e) {
    if (e.code === 11000) return res.json({ ok: false, msg: 'Email already exists' });
    res.json({ ok: false, msg: e.message });
  }
});

/* PUT /api/counsellors/:id */
router.put('/counsellors/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super' && String(req.admin._id) !== req.params.id)
      return res.json({ ok: false, msg: 'Not authorized' });
    const { name, email, mobile, role, active, password } = req.body;
    const update = { name, email: email&&email.toLowerCase(), mobile, updatedAt: new Date() };
    if (req.admin.role === 'super') { update.role = role; update.active = active; }
    if (password && password.length >= 6) update.password = await bcrypt.hash(password, 12);
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const c = await Counsellor.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password -otp');
    if (!c) return res.json({ ok: false, msg: 'Counsellor not found' });
    await utils.addLog('counsellor', req.admin.role==='super'?'admin':'counsellor', req.admin.name, req.adminId, 'counsellor', c._id, c.name, 'profile_updated', 'Profile updated', req.ip);
    res.json({ ok: true, counsellor: c });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* DELETE /api/counsellors/:id */
router.delete('/counsellors/:id', requireSuper, async (req, res) => {
  try {
    const c = await Counsellor.findByIdAndDelete(req.params.id);
    if (!c) return res.json({ ok: false, msg: 'Not found' });
    await utils.addLog('counsellor', 'admin', req.admin.name, req.adminId, 'counsellor', req.params.id, c.name, 'deleted', 'Deleted by admin', req.ip);
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* ══════════════════════════════════════════════════
   STUDENTS (Admin + Counsellor)
══════════════════════════════════════════════════ */

/* GET /api/students */
router.get('/students', requireAdmin, async (req, res) => {
  try {
    const { q, course, status, page = 1, limit = 200 } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { mobile: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } }
    ];
    if (course) filter.course = course;
    if (status === 'pending') filter.$expr = { $eq: [{ $size: '$choiceList' }, 0] };
    if (status === 'sent')    filter.$expr = { $gt: [{ $size: '$choiceList' }, 0] };
    const students = await Student.find(filter).select('-otp').sort({ registeredAt: -1 }).limit(parseInt(limit)).skip((page - 1) * limit).populate('assignedCounsellor', 'name email');
    const total = await Student.countDocuments(filter);
    res.json({ ok: true, students, total });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* GET /api/students/:id */
router.get('/students/:id', requireAdmin, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id).select('-otp').populate('assignedCounsellor', 'name email');
    if (!s) return res.json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, student: s });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* PUT /api/students/:id — Admin/Counsellor edits student */
router.put('/students/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, mobile, city, state, course, year, score, air, category, domicile, assignedCounsellor, adminNote, adminInternalNotes } = req.body;
    const update = { name, email: email&&email.toLowerCase(), mobile, city, state, course, year, score, air, category, domicile, assignedCounsellor: assignedCounsellor||null, adminNote, adminInternalNotes, updatedAt: new Date() };
    Object.keys(update).forEach(k => (update[k] === undefined || update[k] === '') && delete update[k]);
    const s = await Student.findByIdAndUpdate(req.params.id, update, { new: true }).select('-otp');
    if (!s) return res.json({ ok: false, msg: 'Student not found' });
    await utils.addLog('student', req.admin.role==='super'?'admin':'counsellor', req.admin.name, req.adminId, 'student', s._id, s.name, 'profile_updated', 'Updated by '+(req.admin.role==='super'?'admin':'counsellor'), req.ip);
    /* Notify student */
    utils.sendNotifyEmail(s.email, s.name, 'Your EduTrack Profile Updated', 'Your counsellor has updated your profile details. Login to view the changes.');
    res.json({ ok: true, student: s.toSafe() });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* DELETE /api/students/:id */
router.delete('/students/:id', requireAdmin, async (req, res) => {
  try {
    const s = await Student.findByIdAndDelete(req.params.id);
    if (!s) return res.json({ ok: false, msg: 'Not found' });
    await utils.addLog('student', 'admin', req.admin.name, req.adminId, 'student', req.params.id, s.name, 'deleted', 'Deleted by admin', req.ip);
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* PUT /api/students/:id/choicelist — Set choice list */
router.put('/students/:id/choicelist', requireAdmin, async (req, res) => {
  try {
    const { choiceList, adminNote } = req.body;
    if (!Array.isArray(choiceList)) return res.json({ ok: false, msg: 'choiceList must be an array' });
    const s = await Student.findByIdAndUpdate(req.params.id, { choiceList, adminNote: adminNote||'', choiceListUpdatedAt: new Date(), updatedAt: new Date() }, { new: true }).select('-otp');
    if (!s) return res.json({ ok: false, msg: 'Student not found' });
    await utils.addLog('student', 'counsellor', req.admin.name, req.adminId, 'student', s._id, s.name, 'choice_list_sent', `Choice list with ${choiceList.length} colleges`, req.ip);
    utils.sendNotifyEmail(s.email, s.name, '📋 Your EduTrack Choice List is Ready!', `Your counsellor ${req.admin.name} has prepared a personalised college choice list with ${choiceList.length} colleges. Login to view your choice list and download your PDF.`);
    res.json({ ok: true, student: s.toSafe() });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* ══════════════════════════════════════════════════
   STUDENT SELF-SERVICE
══════════════════════════════════════════════════ */

/* GET /api/student/profile */
router.get('/student/profile', requireStudent, (req, res) => {
  res.json({ ok: true, student: req.student.toSafe() });
});

/* PUT /api/student/profile — Student edits own profile */
router.put('/student/profile', requireStudent, async (req, res) => {
  try {
    const { mobile, city, state, score, air, category, domicile } = req.body;
    const update = { mobile, city, state, score, air, category, domicile, updatedAt: new Date() };
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const s = await Student.findByIdAndUpdate(req.student._id, update, { new: true }).select('-otp');
    await utils.addLog('student', 'student', req.student.name, req.student._id, 'student', req.student._id, req.student.name, 'self_profile_update', 'Student updated own profile', req.ip);
    res.json({ ok: true, student: s.toSafe() });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* PUT /api/student/saved — Save/unsave colleges */
router.put('/student/saved', requireStudent, async (req, res) => {
  try {
    const { savedColleges } = req.body;
    const s = await Student.findByIdAndUpdate(req.student._id, { savedColleges, updatedAt: new Date() }, { new: true }).select('-otp');
    res.json({ ok: true, student: s.toSafe() });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* ══════════════════════════════════════════════════
   ACTIVITY LOGS (Admin only)
══════════════════════════════════════════════════ */

/* GET /api/logs */
router.get('/logs', requireAdmin, async (req, res) => {
  try {
    const { type, action, date, q, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (type)   filter.type = type;
    if (action) filter.action = action;
    if (date)   { const d = new Date(date); filter.timestamp = { $gte: d, $lt: new Date(d.getTime() + 86400000) }; }
    if (q) filter.$or = [{ actorName: {$regex:q,$options:'i'} }, { targetName: {$regex:q,$options:'i'} }, { action: {$regex:q,$options:'i'} }, { detail: {$regex:q,$options:'i'} }];
    const logs  = await Log.find(filter).sort({ timestamp: -1 }).limit(parseInt(limit)).skip((page - 1) * limit);
    const total = await Log.countDocuments(filter);
    res.json({ ok: true, logs, total });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* GET /api/logs/student/:id */
router.get('/logs/student/:id', requireAdmin, async (req, res) => {
  try {
    const logs = await Log.find({ targetId: req.params.id }).sort({ timestamp: -1 }).limit(200);
    res.json({ ok: true, logs });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* DELETE /api/logs */
router.delete('/logs', requireSuper, async (req, res) => {
  await Log.deleteMany({});
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════ */

/* GET /api/settings */
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const list = await Settings.find({ key: { $not: /^super_otp/ } });
    const settings = {};
    list.forEach(s => settings[s.key] = s.value);
    res.json({ ok: true, settings });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* PUT /api/settings */
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const pairs = req.body;
    const ops = Object.entries(pairs).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value, updatedAt: new Date() }, { upsert: true })
    );
    await Promise.all(ops);
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* PUT /api/settings/superpassword — Change super admin password */
router.put('/settings/superpassword', requireSuper, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.json({ ok: false, msg: 'Password must be at least 6 characters' });
    /* Store encrypted super password in settings */
    const hashed = await bcrypt.hash(password, 12);
    await Settings.findOneAndUpdate({ key: 'super_pass_hash' }, { key: 'super_pass_hash', value: hashed, updatedAt: new Date() }, { upsert: true });
    process.env.SUPER_ADMIN_PASSWORD = password;
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

/* ══════════════════════════════════════════════════
   STATS (Admin)
══════════════════════════════════════════════════ */

/* GET /api/stats */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [totalStudents, totalCounsellors, todayStudents, pending, sent] = await Promise.all([
      Student.countDocuments(),
      Counsellor.countDocuments({ active: true }),
      Student.countDocuments({ registeredAt: { $gte: today } }),
      Student.countDocuments({ $expr: { $eq: [{ $size: '$choiceList' }, 0] } }),
      Student.countDocuments({ $expr: { $gt: [{ $size: '$choiceList' }, 0] } })
    ]);
    res.json({ ok: true, stats: { totalStudents, totalCounsellors, todayStudents, pending, sent } });
  } catch(e) { res.json({ ok: false, msg: e.message }); }
});

module.exports = router;
