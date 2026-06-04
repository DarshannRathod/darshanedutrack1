/* ================================================================
   models/index.js — All Mongoose models
================================================================ */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/* ══ COUNSELLOR / ADMIN ══ */
const CounsellorSchema = new mongoose.Schema({
  name     : { type: String, required: true, trim: true },
  email    : { type: String, required: true, unique: true, lowercase: true, trim: true },
  password : { type: String, required: true, minlength: 6 },
  role     : { type: String, enum: ['super', 'senior', 'counsellor'], default: 'counsellor' },
  mobile   : { type: String, trim: true, default: '' },
  active   : { type: Boolean, default: true },
  otp      : { code: String, expiry: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CounsellorSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.updatedAt = new Date();
  next();
});

CounsellorSchema.methods.checkPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

CounsellorSchema.methods.toSafe = function() {
  const o = this.toObject();
  delete o.password;
  delete o.otp;
  return o;
};

/* ══ STUDENT ══ */
const CollegeSchema = new mongoose.Schema({
  name : String,
  city : String,
  state: String,
  type : { type: String, enum: ['govt','private','deemed','central','nri'], default: 'private' },
  fee  : String,
  code : String
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name       : { type: String, required: true, trim: true },
  email      : { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile     : { type: String, required: true, trim: true },
  city       : { type: String, default: '' },
  state      : { type: String, default: '' },
  course     : { type: String, default: 'MBBS' },
  year       : { type: String, default: '' },
  score      : { type: String, default: '' },
  air        : { type: String, default: '' },
  category   : { type: String, default: 'General' },
  domicile   : { type: String, default: '' },
  assignedCounsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counsellor', default: null },
  choiceList : { type: [CollegeSchema], default: [] },
  adminNote  : { type: String, default: '' },
  adminInternalNotes: { type: String, default: '' },
  savedColleges: { type: [CollegeSchema], default: [] },
  choiceListUpdatedAt: { type: Date },
  otp        : { code: String, expiry: Date },
  registeredAt: { type: Date, default: Date.now },
  updatedAt  : { type: Date, default: Date.now }
});

StudentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

StudentSchema.methods.toSafe = function() {
  const o = this.toObject();
  delete o.otp;
  return o;
};

/* ══ ACTIVITY LOG ══ */
const LogSchema = new mongoose.Schema({
  type      : String,
  actorRole : String,
  actorName : String,
  actorId   : String,
  targetType: String,
  targetId  : String,
  targetName: String,
  action    : String,
  detail    : String,
  ip        : String,
  timestamp : { type: Date, default: Date.now }
});

/* ══ SITE SETTINGS ══ */
const SettingsSchema = new mongoose.Schema({
  key  : { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

const Counsellor = mongoose.model('Counsellor', CounsellorSchema);
const Student    = mongoose.model('Student',    StudentSchema);
const Log        = mongoose.model('Log',        LogSchema);
const Settings   = mongoose.model('Settings',   SettingsSchema);

module.exports = { Counsellor, Student, Log, Settings };
