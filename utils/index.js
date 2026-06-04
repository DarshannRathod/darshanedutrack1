/* utils/index.js */
const { Log } = require('../models');

/* ── Activity Logger ── */
exports.addLog = async (type, actorRole, actorName, actorId, targetType, targetId, targetName, action, detail, ip) => {
  try {
    await Log.create({ type, actorRole, actorName, actorId: String(actorId||''), targetType, targetId: String(targetId||''), targetName, action, detail, ip: ip||'' });
  } catch(e) { /* non-critical */ }
};

/* ── OTP Generator ── */
exports.generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

/* ── Email sender (Nodemailer) ── */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host  : process.env.SMTP_HOST || 'smtp.gmail.com',
    port  : parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth  : { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls   : { rejectUnauthorized: false }
  });
  return transporter;
}

exports.sendOTPEmail = async (toEmail, otp, name, type) => {
  const t = getTransporter();
  if (!t) return false;
  const subject = type === 'counsellor'
    ? 'EduTrack — Counsellor Login OTP'
    : 'EduTrack — Student Login OTP';
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#D42026,#F07820);padding:28px 32px;text-align:center">
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:900">🏥 EduTrack Education Solution</h1>
      <p style="color:rgba(255,255,255,.8);font-size:13px;margin:6px 0 0">NEET Counselling Experts — Nagpur</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;color:#2A0A08;margin-bottom:8px">Hello <strong>${name}</strong>,</p>
      <p style="color:#5C2010;font-size:14px;margin-bottom:24px">Your One-Time Password for EduTrack login:</p>
      <div style="background:#FFF0F0;border:2px dashed #D42026;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#D42026;font-family:monospace">${otp}</div>
        <p style="color:#9A5020;font-size:12px;margin-top:8px">Valid for <strong>10 minutes</strong></p>
      </div>
      <p style="color:#9A5020;font-size:13px;line-height:1.6">If you did not request this OTP, please ignore this email. Never share your OTP with anyone.</p>
    </div>
    <div style="background:#FFF8F0;padding:16px 32px;text-align:center;border-top:1px solid #F5DEB8">
      <p style="font-size:12px;color:#C8906A;margin:0">EduTrack Education Solution · 113/114 Jalaram Mangalam, Hingna Road, Nagpur 440016</p>
      <p style="font-size:12px;color:#C8906A;margin:4px 0 0">📞 8484098904 · edutracksolution@gmail.com</p>
    </div>
  </div>`;
  try {
    await t.sendMail({ from: `"EduTrack Education" <${process.env.SMTP_USER}>`, to: toEmail, subject, html });
    return true;
  } catch(e) {
    console.error('[Email]', e.message);
    return false;
  }
};

exports.sendNotifyEmail = async (toEmail, toName, subject, message) => {
  const t = getTransporter();
  if (!t) return false;
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#D42026,#F07820);padding:20px 32px">
      <h2 style="color:#fff;font-size:18px;margin:0;font-weight:800">🏥 EduTrack Education Solution</h2>
    </div>
    <div style="padding:28px 32px">
      <p style="font-size:15px;color:#2A0A08">Hello <strong>${toName}</strong>,</p>
      <div style="background:#FFF8F0;border-left:4px solid #D42026;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:14px;color:#5C2010;line-height:1.7">${message}</div>
      <p style="font-size:13px;color:#9A5020">Please login to your EduTrack dashboard to view details.</p>
    </div>
    <div style="background:#FFF8F0;padding:14px 32px;text-align:center;border-top:1px solid #F5DEB8">
      <p style="font-size:12px;color:#C8906A;margin:0">EduTrack · 8484098904 · edutracksolution@gmail.com</p>
    </div>
  </div>`;
  try {
    await t.sendMail({ from: `"EduTrack Education" <${process.env.SMTP_USER}>`, to: toEmail, subject, html });
    return true;
  } catch(e) { return false; }
};

/* ── JWT helpers ── */
exports.signToken = (payload) => {
  return require('jsonwebtoken').sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ── Cookie options ── */
exports.cookieOptions = () => ({
  httpOnly: true,
  secure  : process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge  : 7 * 24 * 60 * 60 * 1000
});
