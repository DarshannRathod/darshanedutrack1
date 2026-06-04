/* ================================================================
   public/js/api.js — EduTrack Frontend API Client v2
   Replaces localStorage. All data lives in MongoDB.
   Works across ALL browsers, devices, and users simultaneously.
================================================================ */

var API = (function(){
  'use strict';

  var BASE = '/api';

  /* ── Core fetch wrapper ── */
  async function req(method, path, body) {
    try {
      var opts = {
        method  : method,
        headers : { 'Content-Type': 'application/json' },
        credentials: 'include'
      };
      if (body && method !== 'GET') opts.body = JSON.stringify(body);
      var res  = await fetch(BASE + path, opts);
      var data = await res.json();
      return data;
    } catch(e) {
      console.error('[API]', method, path, e);
      return { ok: false, msg: 'Network error — check your connection' };
    }
  }

  /* ─────────────────────────────────────────────────
     ADMIN / COUNSELLOR AUTH
  ───────────────────────────────────────────────── */
  var Admin = {
    sendOTP     : (email)           => req('POST', '/auth/admin/send-otp',    { email }),
    verifyOTP   : (email, otp)      => req('POST', '/auth/admin/verify-otp',  { email, otp }),
    login       : (email, password) => req('POST', '/auth/admin/password',    { email, password }),
    logout      : ()                => req('POST', '/auth/admin/logout'),
    me          : ()                => req('GET',  '/auth/admin/me'),
  };

  /* ─────────────────────────────────────────────────
     STUDENT AUTH
  ───────────────────────────────────────────────── */
  var StudentAuth = {
    register  : (data)             => req('POST', '/auth/student/register',    data),
    sendOTP   : (email, mobile)    => req('POST', '/auth/student/send-otp',    { email, mobile }),
    verifyOTP : (email, mobile, otp)=> req('POST', '/auth/student/verify-otp', { email, mobile, otp }),
    logout    : ()                 => req('POST', '/auth/student/logout'),
    me        : ()                 => req('GET',  '/auth/student/me'),
  };

  /* ─────────────────────────────────────────────────
     STUDENTS (Admin)
  ───────────────────────────────────────────────── */
  var Students = {
    list       : (params)    => req('GET',    '/students' + (params ? '?'+new URLSearchParams(params) : '')),
    get        : (id)        => req('GET',    '/students/' + id),
    update     : (id, data)  => req('PUT',    '/students/' + id,              data),
    delete     : (id)        => req('DELETE', '/students/' + id),
    setChoiceList:(id, list, note) => req('PUT', '/students/' + id + '/choicelist', { choiceList: list, adminNote: note }),
  };

  /* ─────────────────────────────────────────────────
     STUDENT SELF
  ───────────────────────────────────────────────── */
  var StudentSelf = {
    profile      : ()       => req('GET', '/student/profile'),
    updateProfile: (data)   => req('PUT', '/student/profile',   data),
    updateSaved  : (arr)    => req('PUT', '/student/saved',     { savedColleges: arr }),
  };

  /* ─────────────────────────────────────────────────
     COUNSELLORS (Admin)
  ───────────────────────────────────────────────── */
  var Counsellors = {
    list  : ()           => req('GET',    '/counsellors'),
    create: (data)       => req('POST',   '/counsellors',        data),
    update: (id, data)   => req('PUT',    '/counsellors/' + id,  data),
    delete: (id)         => req('DELETE', '/counsellors/' + id),
  };

  /* ─────────────────────────────────────────────────
     LOGS
  ───────────────────────────────────────────────── */
  var Logs = {
    list      : (params) => req('GET',    '/logs' + (params ? '?'+new URLSearchParams(params) : '')),
    forStudent: (id)     => req('GET',    '/logs/student/' + id),
    clear     : ()       => req('DELETE', '/logs'),
  };

  /* ─────────────────────────────────────────────────
     SETTINGS
  ───────────────────────────────────────────────── */
  var SettingsAPI = {
    get  : ()      => req('GET', '/settings'),
    save : (data)  => req('PUT', '/settings', data),
    setSuperPass: (p) => req('PUT', '/settings/superpassword', { password: p }),
  };

  /* Stats */
  var Stats = { get: () => req('GET', '/stats') };

  return { Admin, StudentAuth, Students, StudentSelf, Counsellors, Logs, SettingsAPI, Stats };
})();
