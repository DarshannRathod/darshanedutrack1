/* ================================================================
   dashboard-app.js v3 — matches dashboard.html IDs exactly
================================================================ */
var STU = null;

document.addEventListener('DOMContentLoaded', async function(){
  var r = await API.StudentAuth.me();
  if (!r.ok){
    window.location.href = 'login.html?next=' + encodeURIComponent(location.href);
    return;
  }
  STU = r.student;
  initDashboard();
});

function initDashboard(){
  /* Sidebar */
  var av = document.getElementById('sbAv');   if(av)  av.textContent  = STU.name.charAt(0).toUpperCase();
  var nm = document.getElementById('sbName'); if(nm)  nm.textContent  = STU.name;
  var sb = document.getElementById('sbSub');  if(sb)  sb.textContent  = STU.course || 'Student';

  /* Welcome */
  var wm = document.getElementById('welcomeMsg');
  if(wm) wm.textContent = 'Welcome, ' + STU.name.split(' ')[0] + '! 👋';

  /* Choice list dot */
  var dot = document.getElementById('clDot');
  if(dot) dot.style.display = (STU.choiceList && STU.choiceList.length) ? 'inline-block' : 'none';

  /* Banner */
  var bm = document.getElementById('bannerMsg');
  if(bm){
    if(STU.choiceList && STU.choiceList.length){
      bm.textContent = '🎉 Your choice list is ready! ' + STU.choiceList.length + ' colleges selected by your counsellor.';
    } else {
      bm.textContent = '⏳ Your counsellor is preparing your personalised choice list. We\'ll notify you!';
    }
  }

  /* Check welcome redirect */
  if(new URLSearchParams(location.search).get('welcome')==='1'){
    history.replaceState({}, '', 'dashboard.html');
  }

  refreshStats();
  dp('overview');
}

/* ── Panel switch ── */
function dp(id){
  document.querySelectorAll('.dpanel').forEach(function(p){ p.classList.remove('on'); });
  document.querySelectorAll('.dash-nav a').forEach(function(a){ a.classList.remove('on'); });
  var panel = document.getElementById('dp-'+id); if(panel) panel.classList.add('on');
  var nav   = document.getElementById('dn-'+id); if(nav)   nav.classList.add('on');
  if(id==='profile')    renderProfile();
  if(id==='choicelist') renderChoiceList();
  if(id==='saved')      renderSaved();
}

/* ── Stats ── */
function refreshStats(){
  var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
  set('ovScore', STU.score ? STU.score+'/720' : '—');
  set('ovAIR',   STU.air   ? '#'+Number(STU.air).toLocaleString() : '—');
  set('ovSaved', (STU.savedColleges||[]).length);
  set('ovCL',    STU.choiceList&&STU.choiceList.length ? STU.choiceList.length+' colleges' : 'Pending');
  /* CL notification */
  var notif = document.getElementById('ovCLNotif');
  if(notif){
    if(STU.choiceList&&STU.choiceList.length){
      notif.innerHTML = '<span style="background:#F0FDF4;color:#059669;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700">✅ Ready — '
        +STU.choiceList.length+' colleges</span>';
    } else {
      notif.innerHTML = '<span style="background:#FFF8F0;color:var(--teal);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700">⏳ Your counsellor is preparing your list</span>';
    }
  }
}

/* ── Profile ── */
function renderProfile(){
  var el = document.getElementById('profileGrid'); if(!el) return;
  var rows = [
    ['👤 Full Name',    STU.name],
    ['📧 Email',        STU.email],
    ['📞 Mobile',       STU.mobile],
    ['🏙️ City',         STU.city  || '—'],
    ['🗺️ State',        STU.state || '—'],
    ['🎓 Course',       STU.course || '—'],
    ['📅 NEET Year',    STU.year   || '—'],
    ['🎯 NEET Score',   STU.score  ? STU.score+' / 720' : '—'],
    ['🏆 All India Rank',STU.air   ? '#'+Number(STU.air).toLocaleString() : '—'],
    ['👥 Category',     STU.category || '—'],
    ['🏠 Domicile',     STU.domicile || STU.state || '—'],
    ['📅 Registered',   new Date(STU.registeredAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})],
  ];
  if(STU.adminNote) rows.push(['💬 Counsellor Note', STU.adminNote]);
  el.innerHTML = rows.map(function(r){
    return '<div class="info-row"><div class="info-label">'+r[0]+'</div><div class="info-val">'+r[1]+'</div></div>';
  }).join('');
}

/* ── Edit profile ── */
function toggleEditProfile(){
  var card = document.getElementById('editProfileCard');
  var btn  = document.getElementById('toggleEditProfileBtn');
  if(!card || !btn) return;
  if(card.style.display==='none'||!card.style.display){
    document.getElementById('epMobile').value   = STU.mobile   || '';
    document.getElementById('epCity').value     = STU.city     || '';
    document.getElementById('epState').value    = STU.state    || '';
    document.getElementById('epScore').value    = STU.score    || '';
    document.getElementById('epAIR').value      = STU.air      || '';
    document.getElementById('epCategory').value = STU.category || 'General';
    document.getElementById('epDomicile').value = STU.domicile || '';
    var msg = document.getElementById('epMsg'); if(msg) msg.style.display='none';
    card.style.display='block';
    btn.textContent='✕ Cancel';
  } else { cancelEditProfile(); }
}
function cancelEditProfile(){
  var card=document.getElementById('editProfileCard'); if(card)card.style.display='none';
  var btn=document.getElementById('toggleEditProfileBtn'); if(btn)btn.textContent='✏️ Edit My Details';
}
async function saveEditProfile(){
  var patch={
    mobile  :(document.getElementById('epMobile')||{value:''}).value.trim(),
    city    :(document.getElementById('epCity')||{value:''}).value.trim(),
    state   :(document.getElementById('epState')||{value:''}).value.trim(),
    score   :(document.getElementById('epScore')||{value:''}).value.trim(),
    air     :(document.getElementById('epAIR')||{value:''}).value.trim(),
    category:(document.getElementById('epCategory')||{value:'General'}).value,
    domicile:(document.getElementById('epDomicile')||{value:''}).value.trim()
  };
  var msg=document.getElementById('epMsg');
  var r=await API.StudentSelf.updateProfile(patch);
  if(r.ok){
    STU=r.student;
    if(msg){msg.textContent='✅ Profile updated!';msg.style.color='#059669';msg.style.display='block';}
    renderProfile(); refreshStats();
    setTimeout(cancelEditProfile, 1800);
  } else {
    if(msg){msg.textContent=r.msg;msg.style.color='#B91C1C';msg.style.display='block';}
  }
}

/* ── Choice list ── */
function renderChoiceList(){
  var el=document.getElementById('clContent'); if(!el) return;
  if(!STU.choiceList||!STU.choiceList.length){
    el.innerHTML='<div style="text-align:center;padding:48px 20px">'
      +'<div style="font-size:60px;margin-bottom:18px">⏳</div>'
      +'<h3 style="font-family:var(--font-h);font-size:20px;font-weight:800;margin-bottom:10px">Choice List Being Prepared</h3>'
      +'<p style="color:var(--text-lt);font-size:14px;max-width:400px;margin:0 auto 24px;line-height:1.7">Your EduTrack counsellor is analysing your NEET profile and preparing a personalised college selection for you.</p>'
      +'<a href="https://wa.me/918484098904?text='+encodeURIComponent('Hi EduTrack! I am '+STU.name+'. When will my choice list be ready? NEET Score: '+(STU.score||'?')+', AIR: '+(STU.air?'#'+STU.air:'?'))+'" target="_blank" class="btn btn-wa">💬 Ask on WhatsApp</a>'
      +'</div>';
    return;
  }
  var note=STU.adminNote?'<div style="background:#FFFBEB;border:2px solid #FDE68A;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#92400E;line-height:1.7">💬 <strong>Counsellor Note:</strong><br>'+STU.adminNote+'</div>':'';
  var updated=STU.choiceListUpdatedAt?'<div style="font-size:12px;color:var(--text-xlt);margin-bottom:14px">Last updated: '+new Date(STU.choiceListUpdatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+'</div>':'';
  var tbody=STU.choiceList.map(function(c,i){
    var tc=c.type==='govt'?'#1D4ED8':c.type==='deemed'?'#B34700':'#D42026';
    var tb=c.type==='govt'?'#EFF6FF':c.type==='deemed'?'#FFF8E8':'#FEF2F2';
    return '<tr>'
      +'<td style="font-weight:900;color:var(--violet);text-align:center">'+(i+1)+'</td>'
      +'<td><strong>'+c.name+'</strong></td>'
      +'<td style="font-size:12px;color:var(--text-lt)">'+(c.city||'—')+'</td>'
      +'<td><span style="background:'+tb+';color:'+tc+';padding:2px 8px;border-radius:20px;font-size:11px;font-weight:800">'+(c.type||'private').toUpperCase()+'</span></td>'
      +'<td style="font-weight:700;color:var(--violet)">'+(c.fee||'—')+'</td>'
      +'<td><button onclick="askAboutCollege(\''+c.name.replace(/'/g,"\\'")+'\')" class="btn btn-sm" style="padding:3px 9px;font-size:11px;background:var(--surface);border:1.5px solid var(--border)">Ask</button></td>'
      +'</tr>';
  }).join('');
  el.innerHTML=note+updated
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px">'
    +'<h4 style="font-family:var(--font-h);font-size:15px;font-weight:800">'+STU.choiceList.length+' Colleges — Personalised for You</h4>'
    +'<button onclick="downloadPDF()" class="btn btn-primary btn-sm">📄 Download PDF</button></div>'
    +'<div class="tcard"><div class="twrap"><table class="atable">'
    +'<thead><tr><th>#</th><th>College</th><th>City</th><th>Type</th><th>Annual Fee</th><th></th></tr></thead>'
    +'<tbody>'+tbody+'</tbody></table></div></div>';
}

/* ── Saved colleges ── */
function renderSaved(){
  var el=document.getElementById('savedContent'); if(!el) return;
  var saved=STU.savedColleges||[];
  if(!saved.length){
    el.innerHTML='<p style="color:var(--text-xlt);font-style:italic;padding:20px 0;text-align:center">No colleges saved yet.<br><small>Browse the <a href="institutes.html" style="color:var(--violet)">Institutes page</a> and save colleges you like.</small></p>';
    return;
  }
  el.innerHTML=saved.map(function(c,i){
    return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-weight:900;color:var(--violet);min-width:24px">'+(i+1)+'.</span>'
      +'<div style="flex:1"><strong>'+c.name+'</strong><br><span style="font-size:12px;color:var(--text-lt)">'+c.city+' · '+(c.type||'').toUpperCase()+' · '+c.fee+'</span></div>'
      +'<button onclick="removeSaved('+i+')" class="btn btn-sm" style="background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA;padding:3px 9px;font-size:11px">Remove</button>'
      +'</div>';
  }).join('');
}
async function removeSaved(idx){
  STU.savedColleges.splice(idx,1);
  await API.StudentSelf.updateSaved(STU.savedColleges);
  refreshStats(); renderSaved();
}

/* ── PDF download ── */
async function downloadPDF(){
  var r=await API.StudentAuth.me(); if(r.ok) STU=r.student;
  var list=STU.choiceList||[], note=STU.adminNote||'';
  if(!list.length){ alert('Your choice list is not ready yet. Please check back later.'); return; }
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>EduTrack Choice List — '+STU.name+'</title>'
    +'<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Segoe UI",Arial,sans-serif;color:#1a0604}'
    +'.pg{padding:32px 40px;max-width:900px;margin:0 auto}.hdr{display:flex;justify-content:space-between;padding-bottom:14px;border-bottom:3px solid #D42026;margin-bottom:18px}'
    +'.bn{font-size:18px;font-weight:900;color:#D42026}.bt{font-size:11px;color:#888;line-height:1.5}h1{font-size:16px;font-weight:800;margin-bottom:12px}'
    +'.ig{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;background:#FFF8F0;border:1.5px solid #F2D9C0;border-radius:8px;padding:12px;margin-bottom:14px}'
    +'.ir{font-size:12px;color:#4a1810}.il{font-weight:700;color:#D42026}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:14px}thead tr{background:linear-gradient(135deg,#D42026,#F07820)}'
    +'th{padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase}'
    +'td{padding:8px 10px;border-bottom:1px solid #F2D9C0;font-size:12px}tr:nth-child(even) td{background:#FFFBF5}'
    +'.ft{text-align:center;font-size:11px;color:#aaa;margin-top:16px;padding-top:12px;border-top:1px solid #F2D9C0}'
    +'@media print{.pg{padding:18px}@page{margin:10mm}}</style></head><body><div class="pg">'
    +'<div class="hdr"><div><div class="bn">🏥 EduTrack Education Solution</div>'
    +'<div class="bt">113/114 Jalaram Mangalam, Hingna Road, Nagpur–440016 | 📞 8484098904 | edutracksolution@gmail.com</div></div>'
    +'<div style="text-align:right;font-size:11px;color:#666">'+new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+'<br>Ref: ET-'+STU._id.slice(-6).toUpperCase()+'</div></div>'
    +'<h1>📋 Personalised NEET College Choice List</h1>'
    +'<div class="ig">'
    +'<div class="ir"><span class="il">Student: </span>'+STU.name+'</div>'
    +'<div class="ir"><span class="il">Course: </span>'+STU.course+'</div>'
    +'<div class="ir"><span class="il">Email: </span>'+STU.email+'</div>'
    +'<div class="ir"><span class="il">Mobile: </span>'+STU.mobile+'</div>'
    +'<div class="ir"><span class="il">NEET Score: </span>'+(STU.score||'—')+' / 720</div>'
    +'<div class="ir"><span class="il">AIR: </span>'+(STU.air?'#'+Number(STU.air).toLocaleString():'—')+'</div>'
    +'<div class="ir"><span class="il">Category: </span>'+(STU.category||'—')+'</div>'
    +'<div class="ir"><span class="il">Domicile: </span>'+(STU.domicile||STU.state||'—')+'</div>'
    +'</div>'
    +(note?'<div style="background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#92400E">💬 '+note+'</div>':'')
    +'<table><thead><tr><th>#</th><th>College</th><th>City</th><th>Type</th><th>Annual Fee</th></tr></thead><tbody>'
    +list.map(function(c,i){
      return '<tr><td style="font-weight:900;color:#D42026;text-align:center">'+(i+1)+'</td>'
        +'<td style="font-weight:600">'+c.name+'</td>'
        +'<td style="font-size:11px">'+(c.city||'—')+'</td>'
        +'<td style="font-size:11px">'+(c.type||'').toUpperCase()+'</td>'
        +'<td style="font-weight:700;color:#D42026">'+(c.fee||'—')+'</td></tr>';
    }).join('')+'</tbody></table>'
    +'<div class="ft">EduTrack Education Solution · edutracksolution.co.in · Counselled with ❤️ from Nagpur</div>'
    +'</div></body></html>';
  var win=window.open('','_blank'); if(!win){alert('Please allow popups.'); return;}
  win.document.write(html); win.document.close(); setTimeout(function(){win.focus();win.print();},600);
}

/* ── Helpers ── */
function askAboutCollege(name){
  var msg='Hi EduTrack! 🏥\n\nI have a query about: *'+name+'*\n\nMy details:\n• Name: '+STU.name+'\n• Course: '+STU.course+'\n• Score: '+(STU.score||'?')+'\n• AIR: '+(STU.air?'#'+Number(STU.air).toLocaleString():'?');
  window.open('https://wa.me/918484098904?text='+encodeURIComponent(msg),'_blank','noopener');
}

async function studentLogout(){
  await API.StudentAuth.logout();
  window.location.href='login.html';
}

/* ── Fix ET.logout() call in HTML ── */
var ET = { logout: studentLogout };
