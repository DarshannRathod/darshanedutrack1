/* ================================================================
   admin-app.js — EduTrack Admin Panel Application
   Uses API.* calls to MongoDB backend.
   No localStorage for shared data.
================================================================ */

/* ── Current admin info (in memory only) ── */
var ADMIN = null;
var _sid = null, _picked = [], _pickerSid = null;

/* ── Toast ── */
function toast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast on' + (type === 'err' ? ' err' : '');
  clearTimeout(t._to);
  t._to = setTimeout(function(){ t.classList.remove('on'); }, 3000);
}

/* ── Panel switch ── */
var TITLES = {
  overview:'📊 Overview', students:'👥 All Students', choices:'📋 Choice Lists',
  picker:'🏛️ Browse Institutes', counsellors:'👤 Manage Counsellors',
  logs:'📋 Activity Logs', myprofile:'👤 My Profile',
  export:'📥 Export', settings:'⚙️ Settings'
};

function gp(id) {
  document.querySelectorAll('.apanel').forEach(function(p){ p.classList.remove('on'); });
  document.querySelectorAll('.admin-nav a, .admin-nav button').forEach(function(a){ a.classList.remove('on'); });
  var panel = document.getElementById('ap-' + id); if (panel) panel.classList.add('on');
  var nav   = document.getElementById('an-' + id); if (nav)   nav.classList.add('on');
  var pt = document.getElementById('pageTitle'); if (pt) pt.textContent = TITLES[id] || '';
  if (id === 'overview')    renderOverview();
  if (id === 'students')    renderStudents();
  if (id === 'choices')     renderChoices();
  if (id === 'counsellors') renderCounsellors();
  if (id === 'logs')        renderLogs();
  if (id === 'myprofile')   loadSelfProfile();
  if (id === 'settings')    loadSettings();
  if (id === 'picker')      initPicker();
}

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  var r = await API.Admin.me();
  if (!r.ok) { showAuthPage(); return; }
  ADMIN = r.user;
  showDash();
});

function showAuthPage() {
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('dashPage').style.display = 'none';
}

function showDash() {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('dashPage').style.display = 'block';
  document.getElementById('sbAv').textContent    = (ADMIN.name || '?').charAt(0).toUpperCase();
  document.getElementById('sbName').textContent  = ADMIN.name;
  document.getElementById('topEmail').textContent = ADMIN.email || '';
  var sr = document.getElementById('sbRole');
  if (sr) sr.textContent = ADMIN.role === 'super' ? 'Super Administrator' : (ADMIN.role === 'senior' ? 'Senior Counsellor' : 'Counsellor');
  if (ADMIN.role === 'super') {
    var sb = document.getElementById('sbSuperBadge'); if (sb) sb.style.display = 'block';
    document.querySelectorAll('.super-only').forEach(function(el){ el.style.display='flex'; el.classList.add('visible'); });
    var sha = document.getElementById('shSuperAdmin'); if (sha) sha.style.display = 'block';
  }
  renderOverview();
  initPicker();
}

/* ═══════════════════════════════════════
   AUTH — OTP LOGIN
═══════════════════════════════════════ */
var _loginMethod = 'otp', _loginEmail = '', _loginTimer = null;

function switchLoginMethod(m) {
  _loginMethod = m;
  document.querySelectorAll('.lmt').forEach(function(b, i){ b.classList.toggle('active', (m==='otp'&&i===0)||(m==='pass'&&i===1)); });
  document.getElementById('lpOtp').classList.toggle('active', m === 'otp');
  document.getElementById('lpPass').classList.toggle('active', m === 'pass');
  clearMsg();
}

function showErr(t) { var e=document.getElementById('authErr'); document.getElementById('authErrT').textContent=t; e.classList.add('on'); document.getElementById('authOk').classList.remove('on'); }
function showOk(t)  { var e=document.getElementById('authOk');  document.getElementById('authOkT').textContent=t;  e.classList.add('on'); document.getElementById('authErr').classList.remove('on'); }
function clearMsg() { document.getElementById('authErr').classList.remove('on'); document.getElementById('authOk').classList.remove('on'); }

function otpNav(inp, idx, rowId) {
  inp.value = inp.value.replace(/[^0-9]/g,'');
  if (inp.value && idx < 5) { var a = document.querySelectorAll('#'+rowId+' input'); if(a[idx+1]) a[idx+1].focus(); }
  inp.classList.toggle('done', !!inp.value);
}
function getOTPVal(rowId) {
  return Array.from(document.querySelectorAll('#'+rowId+' input')).map(function(i){ return i.value; }).join('');
}

async function otpStep1() {
  var em = document.getElementById('otpEmail').value.trim();
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showErr('Please enter a valid email address.'); return; }
  _loginEmail = em;
  var btn = document.getElementById('otpSendBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  var r = await API.Admin.sendOTP(em);
  if (btn) { btn.disabled = false; btn.textContent = 'Send OTP →'; }
  if (!r.ok) { showErr(r.msg); return; }
  showOk(r.msg);
  if (r.demo && r.otp) alert('🔐 DEMO MODE\nOTP: ' + r.otp + '\n\nConfigure SMTP in Settings to receive real emails.');
  var prev = document.getElementById('otpEmailPrev'); if (prev) prev.textContent = em.replace(/(.{3}).*(@.*)/, '$1***$2');
  document.getElementById('otpS1').classList.remove('active');
  document.getElementById('otpS2').classList.add('active');
  startLoginTimer();
  setTimeout(function(){ var f=document.querySelector('#otpRow input'); if(f) f.focus(); }, 100);
}

async function otpStep2() {
  var entered = getOTPVal('otpRow');
  if (entered.length < 6) { showErr('Enter the complete 6-digit OTP.'); return; }
  var btn = document.querySelector('#otpS2 .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
  var r = await API.Admin.verifyOTP(_loginEmail, entered);
  if (btn) { btn.disabled = false; btn.textContent = 'Verify & Login →'; }
  if (!r.ok) { showErr(r.msg); return; }
  ADMIN = r.user;
  clearInterval(_loginTimer);
  showDash();
}

function otpBack() {
  clearInterval(_loginTimer);
  document.querySelectorAll('#otpRow input').forEach(function(i){ i.value=''; i.classList.remove('done'); });
  document.getElementById('otpS2').classList.remove('active');
  document.getElementById('otpS1').classList.add('active');
  clearMsg();
}

async function otpResend() {
  document.querySelectorAll('#otpRow input').forEach(function(i){ i.value=''; i.classList.remove('done'); });
  var r = await API.Admin.sendOTP(_loginEmail);
  if (r.ok) {
    showOk(r.msg);
    if (r.demo && r.otp) alert('🔐 DEMO OTP: ' + r.otp);
    startLoginTimer();
  } else {
    showErr(r.msg);
  }
}

async function passLogin() {
  var em = document.getElementById('passEmail').value.trim();
  var pw = document.getElementById('passPassword').value;
  if (!em || !pw) { showErr('Enter email and password.'); return; }
  var btn = document.querySelector('#lpPass .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
  var r = await API.Admin.login(em, pw);
  if (btn) { btn.disabled = false; btn.textContent = '🔑 Login with Password'; }
  if (!r.ok) { showErr(r.msg); return; }
  ADMIN = r.user;
  showDash();
}

function togglePassVis() {
  var inp = document.getElementById('passPassword');
  var btn = document.getElementById('passVisBtn');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

function startLoginTimer() {
  var c=120, cEl=document.getElementById('otpTimerN'), tDiv=document.getElementById('otpTimerDiv'), lnk=document.getElementById('otpResendLnk');
  if(tDiv) tDiv.style.display='block';
  if(lnk){lnk.style.pointerEvents='none';lnk.style.color='var(--text-xlt)';}
  clearInterval(_loginTimer);
  _loginTimer = setInterval(function(){
    c--; if(cEl) cEl.textContent=c;
    if(c<=0){ clearInterval(_loginTimer); if(tDiv)tDiv.style.display='none'; if(lnk){lnk.style.pointerEvents='auto';lnk.style.color='var(--violet)';} }
  }, 1000);
}

async function adminLogout() {
  await API.Admin.logout();
  ADMIN = null;
  showAuthPage();
}

/* ═══════════════════════════════════════
   OVERVIEW / STATS
═══════════════════════════════════════ */
async function renderOverview() {
  var r = await API.Stats.get();
  if (!r.ok) return;
  var s = r.stats;
  var set = function(id, v) { var el=document.getElementById(id); if(el) el.textContent=v; };
  set('stTotal', s.totalStudents);
  set('stPending', s.pending);
  set('stSent', s.sent);
  set('stToday', s.todayStudents);
  set('stCounsellors', s.totalCounsellors);
}

/* ═══════════════════════════════════════
   STUDENTS TABLE
═══════════════════════════════════════ */
var _stuCache = [];

async function renderStudents() {
  var q  = (document.getElementById('stuQ')||{value:''}).value;
  var co = (document.getElementById('stuCourse')||{value:''}).value;
  var st = (document.getElementById('stuStatus')||{value:''}).value;
  document.getElementById('stuTb').innerHTML = '<tr><td colspan="12" style="text-align:center;padding:24px;color:var(--text-xlt)">Loading...</td></tr>';
  var params = {};
  if (q) params.q = q;
  if (co) params.course = co;
  if (st) params.status = st;
  var r = await API.Students.list(params);
  if (!r.ok) { document.getElementById('stuTb').innerHTML = '<tr><td colspan="12" style="color:#B91C1C;padding:16px">' + r.msg + '</td></tr>'; return; }
  _stuCache = r.students;
  var ss = r.students;
  document.getElementById('stuTb').innerHTML = ss.length ? ss.map(function(s, i) {
    var has = s.choiceList && s.choiceList.length > 0;
    return '<tr data-sid="'+s._id+'">'
      +'<td style="color:var(--text-xlt);font-size:12px">'+(i+1)+'</td>'
      +'<td><strong>'+s.name+'</strong></td>'
      +'<td style="font-size:12px">'+s.email+'</td>'
      +'<td>'+s.mobile+'</td>'
      +'<td style="font-size:12px">'+(s.city||'—')+', '+(s.state||'—')+'</td>'
      +'<td><span class="sbadge course">'+s.course+'</span></td>'
      +'<td style="font-weight:700">'+(s.score||'—')+'</td>'
      +'<td>'+(s.air?'#'+Number(s.air).toLocaleString():'—')+'</td>'
      +'<td>'+(s.category||'—')+'</td>'
      +'<td><span class="sbadge '+(has?'sent':'pending')+'">'+(has?'✅ Sent':'⏳ Pending')+'</span></td>'
      +'<td style="font-size:11px;color:var(--text-lt)">'+fmtDate(s.registeredAt)+'</td>'
      +'<td><div style="display:flex;gap:5px;flex-wrap:wrap">'
      +'<button class="btn btn-primary btn-sm stu-action" data-action="choice" data-id="'+s._id+'" style="padding:4px 8px;font-size:11px">List</button>'
      +'<button class="btn btn-outline-vio btn-sm stu-action" data-action="pick" data-id="'+s._id+'" style="padding:4px 8px;font-size:11px">Browse</button>'
      +(has ? '<button class="btn btn-sm stu-action" data-action="pdf" data-id="'+s._id+'" style="padding:4px 8px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">PDF</button>' : '')
      +'<button class="btn btn-outline-vio btn-sm" onclick="openEditStu(\''+s._id+'\')" style="padding:4px 8px;font-size:11px">✏️</button>'
      +'<button class="btn btn-sm" onclick="viewStuLogs(\''+s._id+'\')" style="padding:4px 8px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">📋</button>'
      +'<button class="btn btn-sm stu-action" data-action="del" data-id="'+s._id+'" style="padding:4px 8px;font-size:11px;background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA">Del</button>'
      +'</div></td>'
      +'</tr>';
  }).join('') : '<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-lt)">No students found.</td></tr>';
  /* Bind actions */
  document.querySelectorAll('.stu-action').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.dataset.id, action = this.dataset.action;
      if (action === 'choice') openModal(id);
      else if (action === 'pick') launchPicker(id);
      else if (action === 'del') delStudent(id);
      else if (action === 'pdf') generatePDF(id);
    });
  });
  document.getElementById('stuCount').textContent = ss.length + ' students';
}

async function delStudent(id) {
  if (!confirm('Delete this student permanently?')) return;
  var r = await API.Students.delete(id);
  if (r.ok) { toast('Student deleted'); renderStudents(); renderOverview(); }
  else toast(r.msg, 'err');
}

/* ═══════════════════════════════════════
   EDIT STUDENT MODAL
═══════════════════════════════════════ */
async function openEditStu(id) {
  var s = _stuCache.find(function(x){ return x._id===id; }) || (await API.Students.get(id)).student;
  if (!s) return;
  document.getElementById('editStuId').value = id;
  document.getElementById('editStuInfo').textContent = 'Editing: ' + s.name;
  document.getElementById('esName').value     = s.name || '';
  document.getElementById('esEmail').value    = s.email || '';
  document.getElementById('esMobile').value   = s.mobile || '';
  document.getElementById('esCity').value     = s.city || '';
  document.getElementById('esState').value    = s.state || '';
  document.getElementById('esCourse').value   = s.course || 'MBBS';
  document.getElementById('esScore').value    = s.score || '';
  document.getElementById('esAIR').value      = s.air || '';
  document.getElementById('esCategory').value = s.category || 'General';
  document.getElementById('esDomicile').value = s.domicile || '';
  document.getElementById('esYear').value     = s.year || '';
  document.getElementById('esAdminNotes').value = s.adminInternalNotes || '';
  /* Counsellors dropdown */
  var sel = document.getElementById('esCounsellor');
  sel.innerHTML = '<option value="">— Unassigned —</option>';
  var cr = await API.Counsellors.list();
  if (cr.ok) cr.counsellors.forEach(function(c){
    var opt = document.createElement('option');
    opt.value = c._id; opt.textContent = c.name + ' (' + c.email + ')';
    if (s.assignedCounsellor && (s.assignedCounsellor._id===c._id || s.assignedCounsellor===c._id)) opt.selected = true;
    sel.appendChild(opt);
  });
  document.getElementById('editStuMsg').style.display = 'none';
  document.getElementById('editStuModal').classList.add('on');
}
function closeEditStu() { document.getElementById('editStuModal').classList.remove('on'); }
async function saveEditStu() {
  var id = document.getElementById('editStuId').value;
  var name = document.getElementById('esName').value.trim();
  var msg  = document.getElementById('editStuMsg');
  if (!name) { msg.textContent='Name required'; msg.style.color='#B91C1C'; msg.style.display='block'; return; }
  var patch = {
    name, email: document.getElementById('esEmail').value.trim(),
    mobile: document.getElementById('esMobile').value.trim(),
    city: document.getElementById('esCity').value.trim(),
    state: document.getElementById('esState').value.trim(),
    course: document.getElementById('esCourse').value,
    score: document.getElementById('esScore').value.trim(),
    air: document.getElementById('esAIR').value.trim(),
    category: document.getElementById('esCategory').value,
    domicile: document.getElementById('esDomicile').value.trim(),
    year: document.getElementById('esYear').value.trim(),
    assignedCounsellor: document.getElementById('esCounsellor').value || null,
    adminInternalNotes: document.getElementById('esAdminNotes').value.trim()
  };
  var r = await API.Students.update(id, patch);
  if (r.ok) {
    msg.textContent = '✅ Saved!'; msg.style.color='#059669'; msg.style.display='block';
    setTimeout(function(){ closeEditStu(); renderStudents(); renderOverview(); }, 1000);
  } else { msg.textContent = r.msg; msg.style.color='#B91C1C'; msg.style.display='block'; }
}

/* ═══════════════════════════════════════
   STUDENT LOGS MODAL
═══════════════════════════════════════ */
async function viewStuLogs(id) {
  var s = _stuCache.find(function(x){ return x._id===id; });
  document.getElementById('stuLogsInfo').textContent = s ? s.name + ' · ' + s.email : id;
  var r = await API.Logs.forStudent(id);
  var tb = document.getElementById('stuLogsTb');
  if (!r.ok || !r.logs.length) {
    tb.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-xlt);padding:20px">No activity logs yet.</td></tr>';
  } else {
    tb.innerHTML = r.logs.map(function(l){
      return '<tr><td style="font-size:11px;white-space:nowrap">'+new Date(l.timestamp).toLocaleString('en-IN')+'</td>'
        +'<td style="font-weight:700;color:var(--violet)">'+l.action+'</td>'
        +'<td>'+l.actorName+'<br><small style="color:var(--text-xlt)">'+l.actorRole+'</small></td>'
        +'<td style="font-size:12px">'+l.detail+'</td></tr>';
    }).join('');
  }
  document.getElementById('stuLogsModal').classList.add('on');
}
function closeStuLogs() { document.getElementById('stuLogsModal').classList.remove('on'); }

/* ═══════════════════════════════════════
   CHOICES TABLE
═══════════════════════════════════════ */
async function renderChoices() {
  var r = await API.Students.list();
  if (!r.ok) return;
  var ss = r.students;
  document.getElementById('choiceTb').innerHTML = ss.length ? ss.map(function(s, i){
    var has = s.choiceList && s.choiceList.length > 0;
    return '<tr>'
      +'<td>'+(i+1)+'</td>'
      +'<td><strong>'+s.name+'</strong><br><small style="color:var(--text-lt)">'+s.email+'</small></td>'
      +'<td>'+s.course+'</td>'
      +'<td>'+(s.score||'—')+'</td>'
      +'<td>'+(s.air?'#'+Number(s.air).toLocaleString():'—')+'</td>'
      +'<td>'+(s.category||'—')+'</td>'
      +'<td>'+(s.domicile||s.state||'—')+'</td>'
      +'<td><span class="sbadge '+(has?'sent':'pending')+'">'+(has?'✅ Sent ('+s.choiceList.length+')':'⏳ Pending')+'</span></td>'
      +'<td><div style="display:flex;gap:5px;flex-wrap:wrap">'
      +'<button class="btn btn-primary btn-sm ch-action" data-action="edit" data-id="'+s._id+'" style="padding:4px 9px;font-size:11px">'+(has?'✏️ Edit':'Build')+'</button>'
      +'<button class="btn btn-outline-vio btn-sm ch-action" data-action="pick" data-id="'+s._id+'" style="padding:4px 9px;font-size:11px">Browse</button>'
      +(has?'<button class="btn btn-sm ch-action" data-action="pdf" data-id="'+s._id+'" style="padding:4px 9px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">PDF</button>':'')
      +'<button class="btn btn-sm" onclick="openEditStu(\''+s._id+'\')" style="padding:4px 9px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">✏️ Student</button>'
      +'</div></td>'
      +'</tr>';
  }).join('') : '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-lt)">No students yet.</td></tr>';
  document.querySelectorAll('.ch-action').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = this.dataset.id, action = this.dataset.action;
      if (action === 'edit') openModal(id);
      else if (action === 'pick') launchPicker(id);
      else if (action === 'pdf') generatePDF(id);
    });
  });
}

/* ═══════════════════════════════════════
   COUNSELLORS
═══════════════════════════════════════ */
async function renderCounsellors() {
  var r = await API.Counsellors.list();
  if (!r.ok) { toast(r.msg, 'err'); return; }
  var html = '';
  /* Super admin card */
  html += '<div class="c-card"><div class="c-av">S</div><div class="c-info">'
    +'<div class="c-name">Super Admin <span class="sbadge super" style="margin-left:8px">⭐ Super</span></div>'
    +'<div class="c-email">'+((window.SITE_CONFIG&&window.SITE_CONFIG.superEmail)||'edutracksolution@gmail.com')+'</div>'
    +'<div class="c-meta">Full system access · Cannot be deleted</div>'
    +'</div><div class="c-actions"><span class="sbadge active">✅ Active</span></div></div>';
  r.counsellors.forEach(function(c){
    html += '<div class="c-card"><div class="c-av">'+c.name.charAt(0).toUpperCase()+'</div>'
      +'<div class="c-info"><div class="c-name">'+c.name+' <span class="sbadge '+(c.role||'counsellor')+'">'+c.role+'</span></div>'
      +'<div class="c-email">'+c.email+'</div>'
      +'<div class="c-meta">Mobile: '+(c.mobile||'—')+' · Added: '+fmtDate(c.createdAt)+'</div>'
      +'</div><div class="c-actions">'
      +'<span class="sbadge '+(c.active!==false?'active':'inactive')+'">'+(c.active!==false?'✅ Active':'🚫 Inactive')+'</span>'
      +'<button class="btn btn-outline-vio btn-sm" onclick="openEditCoun(\''+c._id+'\')" style="padding:4px 10px;font-size:11px">✏️ Edit</button>'
      +'<button class="btn btn-sm" onclick="toggleCounsellor(\''+c._id+'\','+(c.active!==false)+')" style="padding:4px 10px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">'+(c.active!==false?'Deactivate':'Activate')+'</button>'
      +'<button class="btn btn-sm" onclick="delCounsellor(\''+c._id+'\')" style="padding:4px 10px;font-size:11px;background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA">Del</button>'
      +'</div></div>';
  });
  var cc = document.getElementById('counsellorCards'); if (cc) cc.innerHTML = html;
}

async function addCounsellor() {
  var name   = (document.getElementById('addCName')||{value:''}).value.trim();
  var email  = (document.getElementById('addCEmail')||{value:''}).value.trim();
  var pass   = (document.getElementById('addCPass')||{value:''}).value.trim();
  var role   = (document.getElementById('addCRole')||{value:'counsellor'}).value;
  var mobile = (document.getElementById('addCMobile')||{value:''}).value.trim();
  var msg    = document.getElementById('addCMsg');
  if (!name || !email || !pass) { if(msg){msg.textContent='Name, email and password required';msg.style.color='#B91C1C';msg.style.display='block';} return; }
  var r = await API.Counsellors.create({ name, email, password: pass, role, mobile });
  if (r.ok) {
    if(msg){msg.textContent='✅ Counsellor added!';msg.style.color='#059669';msg.style.display='block';}
    ['addCName','addCEmail','addCPass','addCMobile'].forEach(function(id){ var el=document.getElementById(id);if(el)el.value=''; });
    setTimeout(function(){ if(msg)msg.style.display='none'; renderCounsellors(); renderOverview(); }, 1500);
  } else {
    if(msg){msg.textContent=r.msg;msg.style.color='#B91C1C';msg.style.display='block';}
  }
}

async function toggleCounsellor(id, currentActive) {
  var r = await API.Counsellors.update(id, { active: !currentActive });
  if (r.ok) { toast('Status updated'); renderCounsellors(); }
  else toast(r.msg, 'err');
}

async function delCounsellor(id) {
  if (!confirm('Delete this counsellor permanently?')) return;
  var r = await API.Counsellors.delete(id);
  if (r.ok) { toast('Counsellor deleted'); renderCounsellors(); renderOverview(); }
  else toast(r.msg, 'err');
}

/* Edit Counsellor modal */
var _editCounData = null;
async function openEditCoun(id) {
  var r = await API.Counsellors.list();
  if (!r.ok) return;
  var c = r.counsellors.find(function(x){ return x._id===id; });
  if (!c) return;
  _editCounData = c;
  document.getElementById('editCounId').value = id;
  document.getElementById('editCounInfo').textContent = 'Editing: ' + c.name;
  document.getElementById('ecName').value    = c.name || '';
  document.getElementById('ecEmail').value   = c.email || '';
  document.getElementById('ecMobile').value  = c.mobile || '';
  document.getElementById('ecRole').value    = c.role || 'counsellor';
  document.getElementById('ecPassword').value = '';
  document.getElementById('ecStatus').value  = String(c.active !== false);
  document.getElementById('editCounMsg').style.display = 'none';
  document.getElementById('editCounModal').classList.add('on');
}
function closeEditCoun() { document.getElementById('editCounModal').classList.remove('on'); }
async function saveEditCoun() {
  var id = document.getElementById('editCounId').value;
  var name  = document.getElementById('ecName').value.trim();
  var email = document.getElementById('ecEmail').value.trim();
  var msg   = document.getElementById('editCounMsg');
  if (!name || !email) { msg.textContent='Name and email required'; msg.style.color='#B91C1C'; msg.style.display='block'; return; }
  var patch = {
    name, email, mobile: document.getElementById('ecMobile').value.trim(),
    role: document.getElementById('ecRole').value,
    active: document.getElementById('ecStatus').value === 'true'
  };
  var pw = document.getElementById('ecPassword').value;
  if (pw) patch.password = pw;
  var r = await API.Counsellors.update(id, patch);
  if (r.ok) {
    msg.textContent = '✅ Saved!'; msg.style.color = '#059669'; msg.style.display='block';
    setTimeout(function(){ closeEditCoun(); renderCounsellors(); }, 1000);
  } else { msg.textContent = r.msg; msg.style.color='#B91C1C'; msg.style.display='block'; }
}

/* ═══════════════════════════════════════
   MY PROFILE (counsellor self-edit)
═══════════════════════════════════════ */
function loadSelfProfile() {
  if (!ADMIN) return;
  var el;
  el = document.getElementById('spName');   if(el) el.value = ADMIN.name || '';
  el = document.getElementById('spMobile'); if(el) el.value = ADMIN.mobile || '';
  el = document.getElementById('spEmail');  if(el) el.value = ADMIN.email || '';
  document.getElementById('selfProfileMsg').style.display = 'none';
}
async function saveSelfProfile() {
  var name  = document.getElementById('spName').value.trim();
  var mobile= document.getElementById('spMobile').value.trim();
  var newPw = document.getElementById('spNewPassword').value;
  var conf  = document.getElementById('spNewPasswordConfirm').value;
  var msg   = document.getElementById('selfProfileMsg');
  if (!name) { msg.textContent='Name required'; msg.style.background='#FEF2F2'; msg.style.color='#B91C1C'; msg.style.display='block'; return; }
  if (newPw && newPw !== conf) { msg.textContent='Passwords do not match'; msg.style.background='#FEF2F2'; msg.style.color='#B91C1C'; msg.style.display='block'; return; }
  if (newPw && newPw.length < 6) { msg.textContent='Min 6 chars'; msg.style.background='#FEF2F2'; msg.style.color='#B91C1C'; msg.style.display='block'; return; }
  var patch = { name, mobile };
  if (newPw) patch.password = newPw;
  var id = ADMIN.id || ADMIN._id;
  var r;
  if (ADMIN.role === 'super' && newPw) r = await API.SettingsAPI.setSuperPass(newPw);
  else r = await API.Counsellors.update(id, patch);
  if (r.ok || ADMIN.role === 'super') {
    ADMIN.name = name; ADMIN.mobile = mobile;
    document.getElementById('sbName').textContent = name;
    document.getElementById('sbAv').textContent = name.charAt(0).toUpperCase();
    msg.textContent = '✅ Profile updated!'; msg.style.background='#F0FDF4'; msg.style.color='#059669'; msg.style.display='block';
    setTimeout(function(){ msg.style.display='none'; }, 3000);
  } else { msg.textContent = r.msg; msg.style.background='#FEF2F2'; msg.style.color='#B91C1C'; msg.style.display='block'; }
}

/* ═══════════════════════════════════════
   ACTIVITY LOGS
═══════════════════════════════════════ */
var _logsCache = [];
async function renderLogs() {
  var q      = (document.getElementById('logQ')||{value:''}).value;
  var type   = (document.getElementById('logType')||{value:''}).value;
  var action = (document.getElementById('logAction')||{value:''}).value;
  var date   = (document.getElementById('logDate')||{value:''}).value;
  var params = {};
  if (q) params.q = q; if (type) params.type = type; if (action) params.action = action; if (date) params.date = date;
  params.limit = 500;
  var r = await API.Logs.list(params);
  if (!r.ok) return;
  _logsCache = r.logs;
  var tb = document.getElementById('logsTb');
  var icons = { login:'🔐', logout:'🚪', register:'🎓', profile_updated:'✏️', choice_list_sent:'📋', self_profile_update:'👤', created:'➕', deleted:'🗑' };
  if (!r.logs.length) { tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-xlt);padding:20px">No logs found.</td></tr>'; return; }
  tb.innerHTML = r.logs.map(function(l){
    return '<tr><td style="font-size:11px;color:var(--text-lt);white-space:nowrap">'+new Date(l.timestamp).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td>'
      +'<td><strong>'+l.actorName+'</strong><br><small style="color:var(--text-xlt)">'+l.actorRole+'</small></td>'
      +'<td><span class="sbadge '+(l.actorRole==='admin'||l.actorRole==='super'?'super':'counsellor')+'">'+l.actorRole+'</span></td>'
      +'<td>'+(l.targetName||'—')+'<br><small style="color:var(--text-xlt)">'+l.targetType+'</small></td>'
      +'<td>'+(icons[l.action]||'📌')+' <strong>'+l.action+'</strong></td>'
      +'<td style="font-size:12px;color:var(--text-mid)">'+l.detail+'</td></tr>';
  }).join('');
}
async function clearAllLogs() {
  if (!confirm('Clear ALL activity logs permanently?')) return;
  var r = await API.Logs.clear();
  if (r.ok) { toast('Logs cleared'); renderLogs(); }
  else toast(r.msg, 'err');
}
function exportLogs() {
  if (!_logsCache.length) { toast('No logs to export', 'err'); return; }
  var rows = [['Time','Actor','Role','TargetType','TargetName','Action','Detail']];
  _logsCache.forEach(function(l){ rows.push([new Date(l.timestamp).toLocaleString('en-IN'),l.actorName,l.actorRole,l.targetType||'',l.targetName||'',l.action,l.detail||'']); });
  var csv = rows.map(function(r){ return r.map(function(c){ return '"'+String(c||'').replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
  var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'edutrack_logs_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
}

/* ═══════════════════════════════════════
   SETTINGS
═══════════════════════════════════════ */
async function loadSettings() {
  var r = await API.SettingsAPI.get();
  if (!r.ok) return;
  var s = r.settings;
  var set = function(id, key){ var el=document.getElementById(id); if(el&&s[key]!==undefined) el.value=s[key]; };
  set('cfgPubkey','ejs_pubkey'); set('cfgService','ejs_service');
  set('cfgTplAdmin','ejs_template_admin'); set('cfgTplStudent','ejs_template_student');
  set('cfgTplNotify','ejs_template_notify');
  /* SMTP fields */
  set('cfgSmtpHost','smtp_host'); set('cfgSmtpPort','smtp_port');
  set('cfgSmtpUser','smtp_user'); set('cfgSmtpPass','smtp_pass');
}
async function saveSettings() {
  var pairs = {};
  var fields = { cfgPubkey:'ejs_pubkey', cfgService:'ejs_service', cfgTplAdmin:'ejs_template_admin', cfgTplStudent:'ejs_template_student', cfgTplNotify:'ejs_template_notify', cfgSmtpHost:'smtp_host', cfgSmtpPort:'smtp_port', cfgSmtpUser:'smtp_user', cfgSmtpPass:'smtp_pass' };
  Object.keys(fields).forEach(function(elId){ var el=document.getElementById(elId); if(el&&el.value.trim()) pairs[fields[elId]]=el.value.trim(); });
  var r = await API.SettingsAPI.save(pairs);
  if (r.ok) toast('✅ Settings saved');
  else toast(r.msg, 'err');
}

/* ═══════════════════════════════════════
   EXPORT
═══════════════════════════════════════ */
async function exportCSV() {
  var r = await API.Students.list({ limit: 5000 });
  if (!r.ok) { toast(r.msg, 'err'); return; }
  var h = ['Name','Email','Mobile','City','State','Course','Year','Score','AIR','Category','Domicile','Registered','Choice List','Note'];
  var rows = r.students.map(function(s){
    return [s.name,s.email,s.mobile,s.city||'',s.state||'',s.course,s.year||'',s.score||'',s.air||'',s.category,s.domicile||'',fmtDate(s.registeredAt),s.choiceList&&s.choiceList.length?'Sent ('+s.choiceList.length+')':'Pending',s.adminNote||''];
  });
  var csv = [h].concat(rows).map(function(r){ return r.map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
  var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'edutrack_students_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
}

/* ═══════════════════════════════════════
   CHOICE LIST MODAL
═══════════════════════════════════════ */
var _modalSid = null, _modalColleges = [];
async function openModal(id) {
  _modalSid = id;
  var r = await API.Students.get(id);
  if (!r.ok) { toast(r.msg, 'err'); return; }
  var s = r.student;
  _modalColleges = s.choiceList ? [...s.choiceList] : [];
  document.getElementById('modalStuName').textContent = s.name;
  document.getElementById('modalStuInfo').textContent = s.course + ' · ' + s.category + ' · Score: ' + (s.score||'?') + ' · AIR: ' + (s.air?'#'+Number(s.air).toLocaleString():'?');
  document.getElementById('choiceNote').value = s.adminNote || '';
  renderModalList();
  document.getElementById('choiceModal').classList.add('on');
}
function closeModal() { document.getElementById('choiceModal').classList.remove('on'); }
function renderModalList() {
  var el = document.getElementById('modalCollegeList');
  if (!_modalColleges.length) { el.innerHTML = '<p style="color:var(--text-xlt);font-style:italic;padding:12px 0">No colleges added yet. Add from the picker or search below.</p>'; return; }
  el.innerHTML = _modalColleges.map(function(c,i){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-weight:900;color:var(--violet);min-width:22px">'+(i+1)+'.</span>'
      +'<div style="flex:1"><strong>'+c.name+'</strong> <span class="sbadge '+(c.type||'private')+'">'+c.type+'</span>'
      +'<div style="font-size:12px;color:var(--text-lt)">'+c.city+' · '+c.fee+'</div></div>'
      +'<button onclick="_modalColleges.splice('+i+',1);renderModalList()" style="background:none;border:none;color:#DC2626;cursor:pointer;font-size:16px">✕</button>'
      +'</div>';
  }).join('');
}
async function saveChoiceList(draftOnly) {
  if (!_modalSid) return;
  var note = document.getElementById('choiceNote').value;
  var btn = document.querySelector('#choiceModal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  var r = await API.Students.setChoiceList(_modalSid, _modalColleges, note);
  if (btn) { btn.disabled = false; btn.textContent = draftOnly ? '💾 Save Draft' : '✅ Send to Student'; }
  if (r.ok) { toast((draftOnly?'💾 Draft saved':'✅ Sent to student')+' — '+r.student.name); if(!draftOnly){ closeModal(); renderChoices(); renderOverview(); } }
  else toast(r.msg, 'err');
}

/* ═══════════════════════════════════════
   PICKER (INST_DATA — embedded)
═══════════════════════════════════════ */
function initPicker() { /* handled by existing picker code using INST_DATA */ }
function launchPicker(id) { _pickerSid = id; gp('picker'); }

/* ═══════════════════════════════════════
   PDF GENERATION (client-side)
═══════════════════════════════════════ */
async function generatePDF(id) {
  var r = await API.Students.get(id);
  if (!r.ok) { toast(r.msg, 'err'); return; }
  var s = r.student;
  var list = s.choiceList || [], note = s.adminNote || '';
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>EduTrack Choice List — '+s.name+'</title>'
    +'<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Segoe UI",Arial,sans-serif;color:#1a0604}.page{padding:32px 40px;max-width:900px;margin:0 auto}.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #D42026;margin-bottom:20px}.bn{font-size:20px;font-weight:900;color:#D42026}.bt{font-size:11px;color:#888;margin-top:3px;line-height:1.5}.di{text-align:right;font-size:12px;color:#666;line-height:1.7}h1{font-size:18px;font-weight:800;margin-bottom:14px}.ig{display:grid;grid-template-columns:1fr 1fr;gap:7px 22px;background:#FFF8F0;border:1.5px solid #F2D9C0;border-radius:10px;padding:13px 17px;margin-bottom:16px}.ir{font-size:13px;color:#4a1810}.il{font-weight:700;color:#D42026}table{width:100%;border-collapse:collapse;margin-bottom:16px}thead tr{background:linear-gradient(135deg,#D42026,#F07820)}th{padding:9px 11px;text-align:left;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase}td{padding:9px 11px;border-bottom:1px solid #F2D9C0;font-size:13px}tr:nth-child(even) td{background:#FFFBF5}.ft{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #F2D9C0;padding-top:12px;font-size:11px;color:#aaa}.stamp{background:linear-gradient(135deg,#D42026,#F07820);color:#fff;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700}@media print{.page{padding:18px}}</style></head><body><div class="page">'
    +'<div class="hdr"><div><div class="bn">🏥 EduTrack Education Solution</div><div class="bt">113/114 Jalaram Mangalam, Hingna Road, Nagpur – 440016<br>📞 8484098904 · edutracksolution@gmail.com</div></div>'
    +'<div class="di"><strong>NEET Counselling Choice List</strong><br>'+new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+'<br>Ref: ET-'+(s._id||'').slice(-6).toUpperCase()+'<br>Counsellor: '+(ADMIN?ADMIN.name:'EduTrack')+'</div></div>'
    +'<h1>📋 Personalised NEET College Choice List</h1>'
    +'<div class="ig"><div class="ir"><span class="il">Student:</span> '+s.name+'</div><div class="ir"><span class="il">Course:</span> '+s.course+'</div><div class="ir"><span class="il">Email:</span> '+s.email+'</div><div class="ir"><span class="il">Mobile:</span> '+s.mobile+'</div><div class="ir"><span class="il">NEET Score:</span> '+(s.score||'—')+' / 720</div><div class="ir"><span class="il">AIR:</span> '+(s.air?'#'+Number(s.air).toLocaleString():'—')+'</div><div class="ir"><span class="il">Category:</span> '+(s.category||'—')+'</div><div class="ir"><span class="il">Domicile:</span> '+(s.domicile||s.state||'—')+'</div></div>'
    +(note?'<div style="background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:8px;padding:11px 14px;margin-bottom:16px;font-size:13px;color:#92400E">💬 <strong>Note:</strong> '+note+'</div>':'')
    +(list.length?'<table><thead><tr><th>#</th><th>College</th><th>City</th><th>Type</th><th>Fee</th></tr></thead><tbody>'
      +list.map(function(c,i){ return '<tr><td style="font-weight:900;color:#D42026">'+(i+1)+'</td><td style="font-weight:600">'+c.name+'</td><td>'+(c.city||'—')+'</td><td>'+(c.type||'').toUpperCase()+'</td><td style="font-weight:700;color:#D42026">'+(c.fee||'—')+'</td></tr>'; }).join('')
      +'</tbody></table>':'<p style="color:#999;font-style:italic;padding:14px 0">No colleges added yet.</p>')
    +'<div class="ft"><span>EduTrack Education Solution · edutracksolution.co.in</span><span class="stamp">Counselled by EduTrack ✓</span></div>'
    +'</div></body></html>';
  var win = window.open('','_blank'); if(!win){alert('Allow popups'); return;}
  win.document.write(html); win.document.close(); setTimeout(function(){ win.focus(); win.print(); }, 600);
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }

/* ═══════════════════════════════════════
   PICKER — Browse Institutes (uses INST_DATA)
   Fully API-based: saves via API.Students.setChoiceList
═══════════════════════════════════════ */
async function initPicker(){
  var sel=document.getElementById('pickerStudentSel'); if(!sel) return;
  var r=await API.Students.list();
  if(!r.ok) return;
  sel.innerHTML='<option value="">— Select Student —</option>'+r.students.map(function(s){
    return '<option value="'+s._id+'">'+s.name+' · '+s.course+(s.air?' · AIR #'+Number(s.air).toLocaleString():'')+' · '+(s.category||'')+'</option>';
  }).join('');
  if(_pickerSid) sel.value=_pickerSid;
  renderAllStateTables(); renderPickerBasket();
}

async function launchPicker(id){
  _pickerSid=id;
  var r=await API.Students.get(id);
  var s=r.ok?r.student:null;
  _picked=s&&s.choiceList&&s.choiceList.length?s.choiceList.map(function(c){return Object.assign({},c);}):[];
  gp('picker');
}

async function onPickerStudentChange(){
  var sid=document.getElementById('pickerStudentSel').value;
  if(!sid){_pickerSid=null;_picked=[];renderPickerBasket();
    var pn=document.getElementById('pickerStudentName'); if(pn)pn.textContent='Select a student first'; return;}
  _pickerSid=sid;
  var r=await API.Students.get(sid);
  var s=r.ok?r.student:null;
  if(s){
    var pn=document.getElementById('pickerStudentName');
    if(pn)pn.textContent=s.name+' · '+s.course+' · AIR: '+(s.air?'#'+Number(s.air).toLocaleString():'?')+' · '+(s.category||'');
    _picked=s.choiceList&&s.choiceList.length?s.choiceList.map(function(c){return Object.assign({},c);}):[];
  }
  renderPickerBasket(); renderAllStateTables();
}

function renderAllStateTables(){
  var search=(document.getElementById('pickSearch')||{value:''}).value.toLowerCase().trim();
  var typeF=(document.getElementById('pickType')||{value:''}).value;
  var container=document.getElementById('stateTablesContainer'); if(!container)return;
  var pNames=_picked.map(function(p){return p.name.toLowerCase();});
  var html='';
  INST_DATA.forEach(function(grp){
    var cols=grp.colleges.filter(function(c){
      if(typeF&&c.t!==typeF)return false;
      if(search&&!(c.n.toLowerCase().includes(search)||c.c.toLowerCase().includes(search)))return false;
      return true;
    });
    if(!cols.length)return;
    var sid2=grp.state.toLowerCase().replace(/[^a-z0-9]/g,'_');
    var rows=cols.map(function(c,i){
      var isPk=pNames.includes(c.n.toLowerCase());
      var tbg=c.t==='govt'?'background:#EFF6FF;color:#1D4ED8':c.t==='deemed'?'background:#FFF8E8;color:#B34700':'background:#FFF0F0;color:#D42026';
      var fclr=c.gf==='—'?'color:var(--text-xlt)':(c.gf.includes('L')&&parseFloat(c.gf.replace(/[^0-9.]/g,''))>=15)?'color:#D42026;font-weight:700':(c.gf.includes('L')&&parseFloat(c.gf.replace(/[^0-9.]/g,''))>=5)?'color:#D97706;font-weight:700':'color:#059669;font-weight:700';
      return '<tr class="pick-row" data-name="'+c.n.toLowerCase().replace(/"/g,'')+'" data-type="'+c.t+'" data-state="'+grp.state+'" style="'+(isPk?'background:var(--teal-pale)':'')+'">'
        +'<td style="padding:9px 12px;text-align:center;border-bottom:1px solid var(--border)"><input type="checkbox" class="pick-cb" data-sid="'+sid2+'" '+(isPk?'checked':'')+' style="width:16px;height:16px;accent-color:var(--violet);cursor:pointer"></td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border);color:var(--text-xlt);font-size:11px">'+(i+1)+'</td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border);font-weight:700;color:var(--text)">'+c.n+'</td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border)">📍 '+c.c+'</td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border)"><span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;'+tbg+'">'+c.t.toUpperCase()+'</span></td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border);'+fclr+'">'+c.gf+'</td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border);color:var(--text-lt)">'+c.mf+'</td>'
        +'<td style="padding:9px 12px;border-bottom:1px solid var(--border);color:var(--text-xlt)">'+c.rf+'</td>'
        +'</tr>';
    }).join('');
    html+='<div class="state-section" id="ss-'+sid2+'" style="margin-bottom:10px">'
      +'<div class="state-hd" data-sid="'+sid2+'" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,var(--violet),var(--teal));border-radius:var(--r-md);cursor:pointer;user-select:none" onclick="toggleState(\''+sid2+'\')">'
        +'<span style="font-family:var(--font-h);font-size:14px;font-weight:800;color:#fff">'+grp.state+'</span>'
        +'<span style="font-size:12px;color:rgba(255,255,255,.75)">'+cols.length+' colleges ▾</span>'
      +'</div>'
      +'<div id="sb-'+sid2+'" style="display:none;overflow-x:auto">'
        +'<table style="width:100%;border-collapse:collapse;font-size:13px">'
        +'<thead><tr style="background:var(--surface)">'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border);width:40px">✓</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">#</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">College</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">City</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">Type</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">Govt Fee</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">Mgmt Fee</th>'
          +'<th style="padding:8px 12px;border-bottom:2px solid var(--border)">NRI Fee</th>'
        +'</tr></thead>'
        +'<tbody>'+rows+'</tbody></table></div></div>';
  });
  container.innerHTML=html||'<p style="color:var(--text-xlt);padding:20px;text-align:center">No colleges found.</p>';
  /* Bind checkboxes */
  container.querySelectorAll('.pick-cb').forEach(function(cb){
    cb.addEventListener('change',function(){
      var tr=this.closest('tr'); if(!tr)return;
      var name=tr.dataset.name, type=tr.dataset.type, state=tr.dataset.state;
      var fullName=tr.querySelector('td:nth-child(3)').textContent;
      var city=tr.querySelector('td:nth-child(4)').textContent.replace('📍 ','');
      var fee=tr.querySelector('td:nth-child(6)').textContent;
      if(this.checked){
        if(!_picked.find(function(p){return p.name.toLowerCase()===name;})){
          _picked.push({name:fullName,city:city,type:type,state:state,fee:fee});
        }
        tr.style.background='var(--teal-pale)';
      } else {
        _picked=_picked.filter(function(p){return p.name.toLowerCase()!==name;});
        tr.style.background='';
      }
      renderPickerBasket();
    });
  });
}

function toggleState(sid){
  var el=document.getElementById('sb-'+sid);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}

function renderPickerBasket(){
  var basket=document.getElementById('pickerBasket');
  var countEl=document.getElementById('pickerCount');
  if(countEl)countEl.textContent=_picked.length+' selected';
  if(!basket)return;
  if(!_picked.length){
    basket.innerHTML='<p style="font-size:13px;color:var(--text-xlt);font-style:italic;padding:8px 0">No colleges selected. Expand a state below and check boxes to add.</p>';
    return;
  }
  basket.innerHTML='<div id="pickerBasketList">'+_picked.map(function(c,i){
    var tbg=c.type==='govt'?'background:#EFF6FF;color:#1D4ED8':c.type==='deemed'?'background:#FFF8E8;color:#B34700':'background:#FFF0F0;color:#D42026';
    return '<div class="pick-item" draggable="true">'
      +'<div class="pick-seq">'+(i+1)+'</div>'
      +'<div style="flex:1;min-width:0"><div class="pick-name">'+c.name+'</div><div class="pick-meta">📍 '+(c.city||'')+(c.state?' · '+c.state:'')+'</div></div>'
      +'<span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px;flex-shrink:0;'+tbg+'">'+(c.type||'').toUpperCase()+'</span>'
      +'<div style="font-size:12px;color:var(--violet);font-weight:700;flex-shrink:0;margin-left:8px">'+(c.fee||'—')+'</div>'
      +'<button class="pick-remove" onclick="removePicked('+i+')">×</button>'
    +'</div>';
  }).join('')+'</div>';
  initBasketDrag();
}

function removePicked(idx){
  var nm=_picked[idx]?_picked[idx].name.toLowerCase():'';
  _picked.splice(idx,1);
  document.querySelectorAll('.pick-cb').forEach(function(cb){
    var tr=cb.closest('tr');
    if(tr&&(tr.dataset.name||'')===nm){cb.checked=false;tr.style.background='';}
  });
  renderPickerBasket();
}

function initBasketDrag(){
  var list=document.getElementById('pickerBasketList'); if(!list)return;
  var dr=null;
  list.querySelectorAll('.pick-item').forEach(function(item){
    item.addEventListener('dragstart',function(){dr=this;this.style.opacity='.4';});
    item.addEventListener('dragend',  function(){this.style.opacity='';dr=null;});
    item.addEventListener('dragover', function(e){e.preventDefault();if(dr&&this!==dr)this.style.borderTop='2px solid var(--violet)';});
    item.addEventListener('dragleave',function(){this.style.borderTop='';});
    item.addEventListener('drop',function(e){
      e.preventDefault();this.style.borderTop='';
      if(dr&&this!==dr){
        var its=[].slice.call(list.querySelectorAll('.pick-item'));
        var f=its.indexOf(dr),t=its.indexOf(this);
        if(f>-1&&t>-1){var m=_picked.splice(f,1)[0];_picked.splice(t,0,m);renderPickerBasket();}
      }
    });
  });
}

async function applyPickerToChoiceList(){
  if(!_pickerSid){alert('Please select a student from the dropdown.'); return;}
  if(!_picked.length){alert('Please select at least one college.'); return;}
  var choices=_picked.map(function(c){return{name:c.name,city:c.city,type:c.type,fee:c.fee,state:c.state||''};});
  var noteEl=document.getElementById('pickerNote');
  var note=noteEl?noteEl.value:'';
  var r=await API.Students.setChoiceList(_pickerSid,choices,note);
  if(r.ok){
    toast('✅ '+choices.length+' colleges saved to '+r.student.name+"'s list!");
    // Update local cache
    _stuCache=_stuCache.map(function(s){return s._id===_pickerSid?r.student:s;});
    openModal(_pickerSid);
  } else { toast(r.msg,'err'); }
}

/* ═══════════════════════════════════════
   CHOICE LIST MODAL — openModal
═══════════════════════════════════════ */
async function openModal(id){
  _modalSid=id;
  var r=await API.Students.get(id);
  if(!r.ok){toast(r.msg,'err');return;}
  var s=r.student;
  _modalColleges=s.choiceList?s.choiceList.map(function(c){return Object.assign({},c);}):[];
  var mn=document.getElementById('modalStuName');    if(mn)mn.textContent=s.name;
  var mi=document.getElementById('modalStuInfo');    if(mi)mi.textContent=s.course+' · '+s.category+' · Score: '+(s.score||'?')+' · AIR: '+(s.air?'#'+Number(s.air).toLocaleString():'?');
  var cn=document.getElementById('choiceNote');      if(cn)cn.value=s.adminNote||'';
  renderModalList();
  var modal=document.getElementById('choiceModal');
  if(modal)modal.classList.add('on');
}
function closeModal(){
  var modal=document.getElementById('choiceModal'); if(modal)modal.classList.remove('on');
}
function renderModalList(){
  var el=document.getElementById('modalCollegeList'); if(!el)return;
  if(!_modalColleges.length){
    el.innerHTML='<p style="color:var(--text-xlt);font-style:italic;padding:12px 0">No colleges added. Use Browse Institutes or add from picker.</p>';
    return;
  }
  el.innerHTML=_modalColleges.map(function(c,i){
    var tbg=c.type==='govt'?'background:#EFF6FF;color:#1D4ED8':c.type==='deemed'?'background:#FFF8E8;color:#B34700':'background:#FFF0F0;color:#D42026';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-weight:900;color:var(--violet);min-width:24px">'+(i+1)+'.</span>'
      +'<div style="flex:1"><strong>'+c.name+'</strong> <span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px;'+tbg+'">'+(c.type||'').toUpperCase()+'</span>'
      +'<div style="font-size:12px;color:var(--text-lt)">'+(c.city||'—')+' · '+(c.fee||'—')+'</div></div>'
      +'<button onclick="_modalColleges.splice('+i+',1);renderModalList()" style="background:none;border:none;color:#DC2626;cursor:pointer;font-size:18px;padding:0 4px">×</button>'
      +'</div>';
  }).join('');
}
async function saveChoiceList(draftOnly){
  if(!_modalSid)return;
  var note=(document.getElementById('choiceNote')||{value:''}).value;
  var btn=document.querySelector(draftOnly?'#choiceModal .btn-outline-vio':'#choiceModal .btn-primary');
  if(btn){btn.disabled=true;btn.textContent='Saving...';}
  var r=await API.Students.setChoiceList(_modalSid,_modalColleges,note);
  if(btn){btn.disabled=false;btn.textContent=draftOnly?'💾 Save Draft':'✅ Send to Student';}
  if(r.ok){
    toast((draftOnly?'💾 Draft saved':'✅ Sent!')+' — '+r.student.name);
    _stuCache=_stuCache.map(function(s){return s._id===_modalSid?r.student:s;});
    if(!draftOnly){closeModal();renderChoices();renderOverview();}
  } else {toast(r.msg,'err');}
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function toast(msg,type){
  var t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:24px;right:24px;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:700;z-index:9999;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:all .3s';document.body.appendChild(t);}
  t.textContent=msg;
  t.style.background=type==='err'?'#B91C1C':'#059669';
  t.style.color='#fff';
  t.style.opacity='1';
  clearTimeout(t._to);
  t._to=setTimeout(function(){t.style.opacity='0';},3000);
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function fmtDate(iso){ return iso?new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'; }
