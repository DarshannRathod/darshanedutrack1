/* ============================================================
   EDUTRACK — main.js  v7-final
   Clean complete version: nav, counters, predictor,
   rank predictor, cutoff tabs, WA form, smooth scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ══ 1. MEGA DROPDOWN — Stable hover + click ═══════════════ */
  var closeTimer = null;
  var activePanel = null;

  function openPanel(panel) {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (activePanel && activePanel !== panel) {
      activePanel.style.display = '';
    }
    panel.style.display = 'grid';
    activePanel = panel;
  }

  function scheduleClose(panel) {
    closeTimer = setTimeout(function () {
      panel.style.display = '';
      if (activePanel === panel) activePanel = null;
      closeTimer = null;
    }, 150);
  }

  document.querySelectorAll('.has-mega').forEach(function (item) {
    var link  = item.querySelector(':scope > a');
    var panel = item.querySelector('.mega-panel');
    if (!panel) return;
    item.addEventListener('mouseenter', function () { openPanel(panel); });
    item.addEventListener('mouseleave', function () { scheduleClose(panel); });
    panel.addEventListener('mouseenter', function () {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });
    panel.addEventListener('mouseleave', function () { scheduleClose(panel); });
    if (link) {
      link.addEventListener('click', function (e) {
        if (panel.style.display === 'grid') { return; }
        e.preventDefault();
        openPanel(panel);
      });
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-mega')) {
      document.querySelectorAll('.mega-panel').forEach(function (p) { p.style.display = ''; });
      activePanel = null;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.mega-panel').forEach(function (p) { p.style.display = ''; });
      activePanel = null;
    }
  });

  /* ══ 2. SCROLL FADE-UP ════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.10 });
    document.querySelectorAll('.fade-up').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('in'); });
  }

  /* ══ 3. STATS COUNTER ANIMATION ═══════════════════════════ */
  var statsBand = document.querySelector('.stats-band');
  if (statsBand && 'IntersectionObserver' in window) {
    var sObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCounters(); sObs.disconnect(); }
    }, { threshold: 0.35 });
    sObs.observe(statsBand);
  }

  /* ══ 4. WHATSAPP FORM ═════════════════════════════════════ */
  var waForm = document.getElementById('waForm');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name     = (document.getElementById('wfName')     || {}).value  || '';
      var phone    = (document.getElementById('wfPhone')    || {}).value  || '';
      var interest = (document.getElementById('wfInterest') || {}).value  || 'General';
      var email    = (document.getElementById('wfEmail')    || {}).value  || '';
      var msg      = (document.getElementById('wfMsg')      || {}).value  || '';
      name = name.trim(); phone = phone.trim();
      if (!name || !phone) { alert('Please enter your name and mobile number.'); return; }
      var text = encodeURIComponent(
        'Hello EduTrack! 👋\n\n*Name:* ' + name +
        '\n*Mobile:* ' + phone +
        '\n*Interested In:* ' + interest +
        (email ? '\n*Email:* ' + email : '') +
        (msg   ? '\n*Message:* ' + msg  : '') +
        '\n\nPlease guide me for medical counselling.'
      );
      window.open('https://wa.me/918484098904?text=' + text, '_blank');
    });
  }

  /* ══ 5. CUTOFF TABS ════════════════════════════════════════ */
  document.querySelectorAll('.ctab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var id = this.dataset.tab;
      document.querySelectorAll('.ctab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      var panel = document.getElementById(id);
      if (panel) panel.classList.add('active');
    });
  });

  /* ══ 6. FAQ ACCORDION ══════════════════════════════════════ */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq');
      document.querySelectorAll('.faq.open').forEach(function (f) {
        if (f !== item) f.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });

  /* ══ 7. RESULTS FILTER ═════════════════════════════════════ */
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      document.querySelectorAll('.testi[data-type]').forEach(function (card) {
        card.style.display = (!filter || filter === 'all' || card.dataset.type === filter) ? '' : 'none';
      });
    });
  });

  /* ══ 8. SMOOTH SCROLL for # links ═════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══ 9. LAZY IMAGE OBSERVER ════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    var imgObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var img = e.target;
          if (img.dataset.src) { img.src = img.dataset.src; }
          img.classList.add('loaded');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      imgObs.observe(img);
    });
  }

  /* ══ 10. PREFETCH ON HOVER ═════════════════════════════════ */
  var prefetched = new Set();
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('tel') || href.startsWith('mailto') ||
        prefetched.has(href)) return;
    prefetched.add(href);
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, { passive: true });

});

/* ══ COUNTER FUNCTION ══════════════════════════════════════ */
function runCounters() {
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var cur = 0;
    var step = target / 60;
    var t = setInterval(function () {
      cur = Math.min(cur + step, target);
      var display = cur >= 1000 ? (cur / 1000).toFixed(1) + 'K' : Math.floor(cur);
      el.textContent = display + suffix;
      if (cur >= target) clearInterval(t);
    }, 22);
  });
}

/* ══ GLOBAL WA QUICK MESSAGE ═══════════════════════════════ */
function waQuick(service) {
  var text = encodeURIComponent('Hi EduTrack! I need guidance for: *' + service + '*\nPlease help me.');
  window.open('https://wa.me/918484098904?text=' + text, '_blank');
}

/* ══ GLOBAL TOAST ══════════════════════════════════════════ */
function showToast(msg, type) {
  type = type || 'success';
  var old = document.getElementById('et-toast-global');
  if (old) old.remove();
  var el = document.createElement('div');
  el.id = 'et-toast-global';
  el.setAttribute('role', 'alert');
  el.style.cssText =
    'position:fixed;top:88px;left:50%;transform:translateX(-50%);' +
    'padding:14px 28px;border-radius:12px;' +
    'font-family:var(--font-h);font-size:14px;font-weight:700;' +
    'z-index:9999;box-shadow:var(--sh-xl);' +
    'max-width:90vw;text-align:center;' +
    (type === 'success' ? 'background:#059669;color:#fff;' :
     type === 'error'   ? 'background:var(--violet);color:#fff;' :
                          'background:var(--text);color:#fff;');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(function () { el.remove(); }, 300);
  }, 3500);
}
