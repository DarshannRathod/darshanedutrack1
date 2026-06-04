/* ================================================================
   login-app.js  v3 — matches actual login.html IDs exactly
================================================================ */

var _loginEmail='', _loginMobile='', _regData={}, _loginTimer=null;

/* ── helpers ── */
function showLoginErr(msg){ var t=document.getElementById('loginErrTxt'); if(t)t.textContent=msg; var e=document.getElementById('loginErr'); if(e)e.classList.add('on'); }
function hideLoginErr(){ var e=document.getElementById('loginErr'); if(e)e.classList.remove('on'); }
function showRegErr(msg){ var t=document.getElementById('regErrTxt'); if(t)t.textContent=msg; var e=document.getElementById('regErr'); if(e)e.classList.add('on'); }
function hideRegErr(){ var e=document.getElementById('regErr'); if(e)e.classList.remove('on'); }

function step(panelId, ids){
  ids.forEach(function(id){ var el=document.getElementById(id); if(el)el.classList.remove('active'); });
  var target=document.getElementById(panelId); if(target)target.classList.add('active');
}

function otpNav(inp,idx,cls){
  inp.value=inp.value.replace(/[^0-9]/g,'');
  if(inp.value&&idx<5){ var a=document.getElementsByClassName(cls); if(a[idx+1])a[idx+1].focus(); }
  inp.classList.toggle('done',!!inp.value);
}

function getOTP(cls){
  return Array.from(document.getElementsByClassName(cls)).map(function(i){return i.value;}).join('');
}

function startTimer(countId,timerId,resendId){
  var c=120, cEl=document.getElementById(countId), tEl=document.getElementById(timerId), rEl=document.getElementById(resendId);
  if(tEl)tEl.style.display='flex';
  if(rEl){rEl.style.pointerEvents='none';rEl.style.opacity='0.4';}
  clearInterval(_loginTimer);
  _loginTimer=setInterval(function(){
    c--; if(cEl)cEl.textContent=c;
    if(c<=0){ clearInterval(_loginTimer); if(tEl)tEl.style.display='none'; if(rEl){rEl.style.pointerEvents='auto';rEl.style.opacity='1';} }
  },1000);
}

function switchTab(t){
  ['panLogin','panRegister'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('active');});
  var target=document.getElementById(t==='login'?'panLogin':'panRegister');
  if(target)target.classList.add('active');
  document.querySelectorAll('.auth-tab').forEach(function(b,i){b.classList.toggle('active',(t==='login'&&i===0)||(t==='register'&&i===1));});
}

/* ═══════ LOGIN FLOW ═══════ */
async function loginStep1(){
  hideLoginErr();
  var email=( document.getElementById('lEmail')||{value:''}).value.trim();
  var mobile=(document.getElementById('lMobile')||{value:''}).value.trim();
  if(!email||!mobile){ showLoginErr('Email and mobile number are required.'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showLoginErr('Enter a valid email address.'); return; }
  if(mobile.length!==10||!/^\d+$/.test(mobile)){ showLoginErr('Enter a valid 10-digit mobile number.'); return; }
  _loginEmail=email; _loginMobile=mobile;
  var btn=document.getElementById('lSendBtn');
  if(btn){btn.disabled=true;btn.textContent='Sending OTP...';}
  var r=await API.StudentAuth.sendOTP(email,mobile);
  if(btn){btn.disabled=false;btn.textContent='Send OTP →';}
  if(!r.ok){ showLoginErr(r.msg); return; }
  if(r.demo&&r.otp) alert('🔐 DEMO MODE — Email OTP\nYour OTP: '+r.otp+'\n\nConfigure SMTP in Admin → Settings for real emails.');
  var prev=document.getElementById('lEmailPreview'); if(prev)prev.textContent=email.replace(/(.{3}).*(@.*)/,'$1***$2');
  step('loginS2',['loginS1','loginS2']);
  startTimer('lTimerCount','lTimer','lResend');
  setTimeout(function(){var f=document.getElementsByClassName('lotp')[0];if(f)f.focus();},100);
}

async function loginStep2(){
  hideLoginErr();
  var otp=getOTP('lotp');
  if(otp.length<6){ showLoginErr('Enter the complete 6-digit OTP.'); return; }
  var btn=document.getElementById('lVerifyBtn');
  if(btn){btn.disabled=true;btn.textContent='Verifying...';}
  var r=await API.StudentAuth.verifyOTP(_loginEmail,_loginMobile,otp);
  if(btn){btn.disabled=false;btn.textContent='✅ Verify & Login';}
  if(!r.ok){ showLoginErr(r.msg); return; }
  clearInterval(_loginTimer);
  var next=new URLSearchParams(location.search).get('next');
  window.location.href=(next&&!next.startsWith('http'))?decodeURIComponent(next):'dashboard.html';
}

function loginGoBack(){
  clearInterval(_loginTimer);
  Array.from(document.getElementsByClassName('lotp')).forEach(function(i){i.value='';i.classList.remove('done');});
  step('loginS1',['loginS1','loginS2']);
  hideLoginErr();
}

async function loginResend(){
  Array.from(document.getElementsByClassName('lotp')).forEach(function(i){i.value='';i.classList.remove('done');});
  var r=await API.StudentAuth.sendOTP(_loginEmail,_loginMobile);
  if(r.ok){
    if(r.demo&&r.otp)alert('🔐 DEMO OTP: '+r.otp);
    startTimer('lTimerCount','lTimer','lResend');
  } else { showLoginErr(r.msg); }
}

/* ═══════ REGISTER FLOW ═══════ */
function regStep1(){
  hideRegErr();
  var name=(document.getElementById('rName')||{value:''}).value.trim();
  var email=(document.getElementById('rEmail')||{value:''}).value.trim();
  var mobile=(document.getElementById('rMobile')||{value:''}).value.trim();
  var city=(document.getElementById('rCity')||{value:''}).value.trim();
  var state=(document.getElementById('rState')||{value:''}).value.trim();
  if(!name){ showRegErr('Full name is required.'); return; }
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showRegErr('Valid email is required.'); return; }
  if(!mobile||mobile.length!==10||!/^\d+$/.test(mobile)){ showRegErr('Valid 10-digit mobile is required.'); return; }
  _regData={name:name,email:email,mobile:mobile,city:city,state:state};
  step('regS2',['regS1','regS2','regS3']);
  updateRegDots(1);
}

function regGoBack(){ step('regS1',['regS1','regS2','regS3']); updateRegDots(0); }

async function regStep2(){
  hideRegErr();
  var course=(document.getElementById('rCourse')||{value:'MBBS'}).value;
  var year=(document.getElementById('rYear')||{value:''}).value.trim();
  var score=(document.getElementById('rScore')||{value:''}).value.trim();
  var air=(document.getElementById('rAIR')||{value:''}).value.trim();
  var cat=(document.getElementById('rCat')||{value:'General'}).value;
  var dom=(document.getElementById('rDomicile')||{value:''}).value.trim();
  if(!course){ showRegErr('Please select a course.'); return; }
  Object.assign(_regData,{course:course,year:year,score:score,air:air,category:cat,domicile:dom||_regData.state});
  var btn=document.getElementById('rSendOtpBtn');
  if(btn){btn.disabled=true;btn.textContent='Registering...';}
  var r=await API.StudentAuth.register(_regData);
  if(btn){btn.disabled=false;btn.textContent='Send OTP to Email →';}
  if(!r.ok){ showRegErr(r.msg); return; }
  if(r.demo&&r.otp)alert('🔐 DEMO MODE\nVerification OTP: '+r.otp+'\n\nSMTP not configured. Set it in Admin → Settings.');
  var prev=document.getElementById('rEmailPreview');
  if(prev)prev.textContent=_regData.email.replace(/(.{3}).*(@.*)/,'$1***$2');
  step('regS3',['regS1','regS2','regS3']);
  updateRegDots(2);
  startTimer('rTimerCount','rTimer','rResend');
  setTimeout(function(){var f=document.getElementsByClassName('rotp')[0];if(f)f.focus();},100);
}

function regGoBack2(){ step('regS2',['regS1','regS2','regS3']); updateRegDots(1); }

async function regStep3(){
  hideRegErr();
  var otp=getOTP('rotp');
  if(otp.length<6){ showRegErr('Enter the complete 6-digit OTP.'); return; }
  var btn=document.getElementById('rVerifyBtn');
  if(btn){btn.disabled=true;btn.textContent='Creating account...';}
  var r=await API.StudentAuth.verifyOTP(_regData.email,_regData.mobile,otp);
  if(btn){btn.disabled=false;btn.textContent='✅ Create Account';}
  if(!r.ok){ showRegErr(r.msg); return; }
  clearInterval(_loginTimer);
  // Notify counsellor via WhatsApp
  try{
    var wa='Hi EduTrack! 🎓 New student registered.\n\nName: '+_regData.name+'\nEmail: '+_regData.email+'\nMobile: '+_regData.mobile+'\nCourse: '+_regData.course+'\nScore: '+(_regData.score||'?')+'\nAIR: '+(_regData.air?'#'+_regData.air:'?')+'\nCategory: '+_regData.category+'\nState: '+_regData.state;
    window.open('https://wa.me/918484098904?text='+encodeURIComponent(wa),'_blank','noopener');
  }catch(e){}
  window.location.href='dashboard.html?welcome=1';
}

async function regResend(){
  Array.from(document.getElementsByClassName('rotp')).forEach(function(i){i.value='';i.classList.remove('done');});
  // Re-register to get new OTP
  var r=await API.StudentAuth.register(_regData);
  if(r.ok){
    if(r.demo&&r.otp)alert('🔐 DEMO OTP: '+r.otp);
    startTimer('rTimerCount','rTimer','rResend');
  } else {
    // Try student send-otp if already registered
    var r2=await API.StudentAuth.sendOTP(_regData.email,_regData.mobile);
    if(r2.ok){ if(r2.demo&&r2.otp)alert('🔐 DEMO OTP: '+r2.otp); startTimer('rTimerCount','rTimer','rResend'); }
    else showRegErr(r2.msg);
  }
}

function updateRegDots(active){
  [0,1,2].forEach(function(i){
    var el=document.getElementById('rdot'+i);
    if(el){ el.className='rdot'+(i===active?' active':i<active?' done':''); }
  });
}

/* ── Auto-redirect if already logged in ── */
document.addEventListener('DOMContentLoaded',async function(){
  var r=await API.StudentAuth.me();
  if(r.ok){
    var next=new URLSearchParams(location.search).get('next');
    window.location.href=(next&&!next.startsWith('http'))?decodeURIComponent(next):'dashboard.html';
  }
});
