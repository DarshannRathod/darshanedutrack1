/* ============================================================
   EDUTRACK — components.js  v7-final
   Complete: Announce bar · Topbar · Mega Nav · Footer ·
             Mobile Nav · Mobile Bottom Bar · WA Float
   All JS syntax clean and complete
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ══ 1. ANNOUNCEMENT BAR ══════════════════════════════════ */
  const annEl = document.getElementById('announce');
  if (annEl) {
    annEl.innerHTML =
      '📅 <strong>NEET UG 2026 Exam: 21 June 2026</strong> — UG Counselling begins after results &nbsp;|&nbsp;' +
      '📅 <strong>NEET PG 2026 Exam: 30 August 2026</strong> — PG Counselling begins after results &nbsp;|&nbsp;' +
      '🌍 <a href="nri-quota.html" style="color:inherit;font-weight:700">NRI Quota Guide →</a> &nbsp;|&nbsp;' +
      '🏛️ <a href="institutional-quota.html" style="color:inherit;font-weight:700">IQ Seats Guide →</a> &nbsp;|&nbsp;' +
      '<a href="contact.html">📋 Book Free Counselling →</a>' +
      '<span class="close-bar" id="closeAnn" title="Close">✕</span>';
    const closeAnn = document.getElementById('closeAnn');
    if (closeAnn) closeAnn.addEventListener('click', () => annEl.remove());
  }

  /* ══ 2. TOP BAR ══════════════════════════════════════════ */
  const tbEl = document.getElementById('topbar');
  if (tbEl) {
    tbEl.innerHTML =
      '<div class="wrap">' +
        '<div class="topbar-inner">' +
          '<div class="topbar-left">🏥 Nagpur\'s Trusted Medical Counselling · <span>3,500+ Students Guided · 13+ Years</span></div>' +
          '<div class="topbar-right">' +
            '<a href="tel:8484098904" class="topbar-link">📞 8484098904</a>' +
            '<a href="tel:8080901797" class="topbar-link">📞 8080901797</a>' +
            '<a href="mailto:edutracksolution@gmail.com" class="topbar-link">✉️ edutracksolution@gmail.com</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ══ 3. MEGA NAV ══════════════════════════════════════════ */
  const navEl = document.getElementById('site-nav');
  if (navEl) {
    navEl.innerHTML =
      '<nav class="nav" role="navigation" aria-label="Main navigation">' +
        '<div class="wrap">' +
          '<div class="nav-inner">' +

            /* LOGO */
            '<a href="index.html" class="logo" aria-label="EduTrack Education Solution Home">' +
              '<img src="edutrack-logo.jpg" alt="EduTrack Education Solution" class="logo-img" loading="eager" width="auto" height="68">' +
            '</a>' +

            /* NAV LINKS */
            '<ul class="nav-links" role="list">' +
              '<li><a href="index.html">Home</a></li>' +

              /* NEET UG */
              '<li class="has-mega">' +
                '<a href="after12th.html" class="nav-blink-ug"><span class="nav-blink-dot"></span> NEET UG <span class="caret">▾</span></a>' +
                '<div class="mega-panel">' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">📚 NEET UG 2026</div>' +
                    '<a href="after12th.html">About NEET UG 2026</a>' +
                    '<a href="after12th.html#eligibility">Eligibility Criteria</a>' +
                    '<a href="after12th.html#courses">Courses After 12th</a>' +
                    '<a href="after12th.html#workflow">Counselling Workflow</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🗺️ UG Counselling</div>' +
                    '<a href="counselling-ug.html">UG Counselling Process</a>' +
                    '<a href="counselling-ug.html#statewise">State-wise Counselling</a>' +
                    '<a href="counselling-ug.html#authority">Counselling Authorities</a>' +
                    '<a href="cutoff.html">Cutoff &amp; Seat Matrix</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🏛️ Institutes &amp; Fees</div>' +
                    '<a href="institutes.html">State-wise Institutes</a>' +
                    '<a href="institutes.html#aiims">AIIMS Colleges</a>' +
                    '<a href="institutes.html#central">Central Institutes</a>' +
                    '<a href="institutes.html#deemed">Deemed Universities</a>' +
                  '</div>' +
                  '<div class="mega-col mega-cta-col">' +
                    '<div class="mega-col-head">⚡ Quick Actions</div>' +
                    '<a href="cutoff.html" class="mega-action-btn">📈 Cutoff Data</a>' +
                    '<a href="nri-quota.html" class="mega-action-btn">🌍 NRI Quota Guide</a>' +
                    '<a href="institutional-quota.html" class="mega-action-btn">🏛️ IQ Seats Guide</a>' +
                    '<a href="contact.html" class="mega-action-btn">📋 Book Counselling</a>' +
                    '<div class="mega-exam-date"><span class="med-dot"></span> NEET UG Exam: <strong>21 June 2026</strong></div>' +
                  '</div>' +
                '</div>' +
              '</li>' +

              /* NEET PG */
              '<li class="has-mega">' +
                '<a href="afterdegree.html" class="nav-blink-pg"><span class="nav-blink-dot pg"></span> NEET PG <span class="caret">▾</span></a>' +
                '<div class="mega-panel">' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🎓 NEET PG 2026</div>' +
                    '<a href="afterdegree.html">About NEET PG</a>' +
                    '<a href="afterdegree.html#specialty">Specialty Selection</a>' +
                    '<a href="afterdegree.html#aiqstate">AIQ vs State Quota</a>' +
                    '<a href="afterdegree.html#workflow">PG Counselling Steps</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🏛️ Premium PG Institutes</div>' +
                    '<a href="inicet.html">INI-CET (AIIMS / JIPMER / PGI)</a>' +
                    '<a href="inicet.html#aiims">AIIMS PG Seats</a>' +
                    '<a href="inicet.html#pgimer">PGIMER Chandigarh</a>' +
                    '<a href="inicet.html#nimhans">NIMHANS Bengaluru</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🌿 AYUSH PG</div>' +
                    '<a href="afterdegree.html#aiapget">AIAPGET Guide</a>' +
                    '<a href="afterdegree.html#aiapget">MD Ayurveda (BAMS)</a>' +
                    '<a href="afterdegree.html#aiapget">MD Homoeopathy (BHMS)</a>' +
                    '<a href="afterdegree.html#aiapget">MD Unani (BUMS)</a>' +
                  '</div>' +
                  '<div class="mega-col mega-cta-col">' +
                    '<div class="mega-col-head">⚡ Quick Actions</div>' +
                    '<a href="cutoff.html#pg" class="mega-action-btn">📈 PG Cutoff Data</a>' +
                    '<a href="inicet.html" class="mega-action-btn">🏛️ INI-CET Guide</a>' +
                    '<a href="contact.html" class="mega-action-btn">📋 Book PG Counselling</a>' +
                    '<div class="mega-exam-date"><span class="med-dot pg"></span> NEET PG Exam: <strong>30 August 2026</strong></div>' +
                  '</div>' +
                '</div>' +
              '</li>' +

              /* INSTITUTES & FEES */
              '<li class="has-mega">' +
                '<a href="institutes.html">Institutes &amp; Fees <span class="caret">▾</span></a>' +
                '<div class="mega-panel">' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🏛️ Premium Institutes</div>' +
                    '<a href="institutes.html#aiims">AIIMS (20 Campuses)</a>' +
                    '<a href="institutes.html#central">Central Universities</a>' +
                    '<a href="institutes.html#jipmer">JIPMER</a>' +
                    '<a href="institutes.html#esic">ESIC Institutes</a>' +
                    '<a href="institutes.html#deemed">Deemed Universities</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🗺️ State Fees (West)</div>' +
                    '<a href="institutes.html">Maharashtra</a>' +
                    '<a href="institutes.html">Karnataka</a>' +
                    '<a href="institutes.html">Gujarat</a>' +
                    '<a href="institutes.html">Rajasthan</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🗺️ State Fees (North/South)</div>' +
                    '<a href="institutes.html">Uttar Pradesh</a>' +
                    '<a href="institutes.html">Tamil Nadu</a>' +
                    '<a href="institutes.html">Kerala</a>' +
                    '<a href="institutes.html">West Bengal</a>' +
                    '<a href="institutes.html">Andhra Pradesh / Telangana</a>' +
                  '</div>' +
                  '<div class="mega-col mega-cta-col">' +
                    '<div class="mega-col-head">🌍 MBBS Abroad</div>' +
                    '<a href="mbbsabroad.html" class="mega-action-btn">🌍 MBBS Abroad Guide</a>' +
                    '<a href="mbbsabroad.html#russia">Russia</a>' +
                    '<a href="mbbsabroad.html#georgia">Georgia</a>' +
                    '<a href="mbbsabroad.html#kazakhstan">Kazakhstan</a>' +
                  '</div>' +
                '</div>' +
              '</li>' +

              /* SERVICES */
              '<li><a href="services.html">Services</a></li>' +

              /* TOOLS */
              '<li class="has-mega">' +
                '<a href="#">Tools <span class="caret">▾</span></a>' +
                '<div class="mega-panel tools-panel">' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">🔮 Prediction Tools</div>' +
                    '<a href="cutoff.html">Cutoff Data (3-year trends)</a>' +
                    '<a href="contact.html">Book Counselling Session</a>' +
                    '<a href="cutoff.html">Cutoff Data (3-year trends)</a>' +
                  '</div>' +
                  '<div class="mega-col">' +
                    '<div class="mega-col-head">📺 Prime &amp; Webinars</div>' +
                    '<a href="webinar.html">Live Webinars</a>' +
                    '<a href="webinar.html#plans">EduTrack Prime Plans</a>' +
                    '<a href="contact.html">Book 1-on-1 Session</a>' +
                  '</div>' +
                '</div>' +
              '</li>' +

              '<li><a href="results.html">Results</a></li>' +
              '<li><a href="contact.html">Contact</a></li>' +
            '</ul>' +

            /* CTA ACTIONS */
            '<div class="nav-actions" id="navActions">' +
              '<a href="login.html" class="btn btn-outline-vio btn-sm login-btn" id="navLoginBtn">👤 Student Login</a>' +
              '<a href="admin.html" class="btn btn-sm" style="background:var(--text);color:#fff">🔐 Counsellor</a>' +
              '<a href="predictor.html" class="btn btn-outline-vio btn-sm">🔮 Predictor</a>' +
              '<a href="contact.html" class="btn btn-primary btn-sm">📋 Book Free Session</a>' +
            '</div>' +

            /* HAMBURGER */
            '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">' +
              '<span></span><span></span><span></span>' +
            '</button>' +

          '</div>' +
        '</div>' +
      '</nav>' +

      /* MOBILE NAV PANEL */
      '<div class="mobile-nav" id="mobileNav" role="dialog" aria-label="Mobile navigation">' +
        '<div class="mobile-nav-header">' +
          '<a href="index.html" class="logo">' +
            '<img src="edutrack-logo.jpg" alt="EduTrack Education Solution" class="logo-img" style="height:48px;" loading="eager">' +
          '</a>' +
          '<button class="mobile-nav-close" id="mobileClose" aria-label="Close menu">✕</button>' +
        '</div>' +

        '<a href="index.html">🏠 Home</a>' +

        '<div class="mob-section-head">📚 NEET UG</div>' +
        '<a href="after12th.html" style="color:var(--teal-lt)!important">🩺 After 12th — NEET UG Guide</a>' +
        '<a href="counselling-ug.html">📋 UG Counselling Process</a>' +
        '<a href="institutes.html">🏛️ Institutes &amp; Fees</a>' +
        '<a href="cutoff.html">📈 Cutoff Data</a>' +

        '<div class="mob-section-head">🎓 NEET PG</div>' +
        '<a href="afterdegree.html" style="color:var(--teal-lt)!important">💊 After MBBS — NEET PG Guide</a>' +
        '<a href="inicet.html">🏛️ INI-CET (AIIMS / JIPMER / PGI)</a>' +
        '<a href="afterdegree.html#aiapget">🌿 AIAPGET (AYUSH PG)</a>' +

        '<div class="mob-section-head">🌍 Institutes &amp; Abroad</div>' +
        '<a href="institutes.html">🗺️ State-wise MBBS Fees</a>' +
        '<a href="mbbsabroad.html">🌍 MBBS Abroad</a>' +

        '<div class="mob-section-head">🔮 Tools</div>' +
        '<a href="cutoff.html">📈 Cutoff Data</a>' +
        '<a href="webinar.html">📺 Webinars &amp; Prime</a>' +

        '<a href="services.html">⚕️ Services</a>' +
        '<a href="results.html">🏆 Student Results</a>' +
        '<a href="about.html">ℹ️ About EduTrack</a>' +
        '<a href="contact.html">📩 Contact Us</a>' +
        '<a href="login.html">👤 Student Login / Register</a>' +
        '<a href="dashboard.html">📊 My Dashboard</a>' +
        '<a href="admin.html" style="color:var(--amber-lt)!important">🔐 Counsellor Admin Login</a>' +

        '<div class="mobile-nav-actions">' +
          '<a href="tel:8484098904" class="btn btn-outline-white">📞 8484098904</a>' +
          '<a href="https://wa.me/918484098904" class="btn btn-wa" target="_blank">💬 WhatsApp</a>' +
          '<a href="contact.html" class="btn btn-primary">📋 Book Free Session</a>' +
        '</div>' +
      '</div>';

    /* Hamburger / Close logic */
    const ham   = document.getElementById('hamburger');
    const mNav  = document.getElementById('mobileNav');
    const close = document.getElementById('mobileClose');

    function toggleMobileNav(force) {
      const open = (force !== undefined) ? force : !mNav.classList.contains('open');
      mNav.classList.toggle('open', open);
      if (ham) {
        ham.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', String(open));
      }
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (ham)   ham.addEventListener('click', () => toggleMobileNav());
    if (close) close.addEventListener('click', () => toggleMobileNav(false));
    document.querySelectorAll('#mobileNav a').forEach(a => {
      a.addEventListener('click', () => toggleMobileNav(false));
    });

    /* Active link highlight */
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links > li > a').forEach(a => {
      if (a.getAttribute('href') === page) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    /* Update nav for logged-in student */
    if (typeof ET !== 'undefined') {
      ET.updateNav();
    }
  }

  /* ══ 4. FOOTER ════════════════════════════════════════════ */
  const footEl = document.getElementById('site-footer');
  if (footEl) {
    footEl.innerHTML =

      /* CTA STRIP */
      '<section class="cta-strip">' +
        '<div class="wrap">' +
          '<div class="cta-strip-inner">' +
            '<h2>Ready to secure your medical seat?</h2>' +
            '<p>Personalised counselling — <strong>NEET UG &amp; NEET PG</strong> — based on your rank, state and specialisation.<br>' +
            'Honest guidance · No false promises · 3,500+ students guided · 13+ years.</p>' +
            '<div class="cta-btns">' +
              '<a href="predictor.html" class="btn btn-outline-white btn-lg">🔮 Free College Predictor</a>' +
              '<a href="contact.html" class="btn btn-primary btn-lg">📋 Book Free Session</a>' +
              '<a href="https://wa.me/918484098904" class="btn btn-wa btn-lg" target="_blank">💬 WhatsApp Now</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* FOOTER BODY */
      '<footer role="contentinfo">' +
        '<div class="footer-top">' +
          '<div class="wrap">' +
            '<div class="footer-grid">' +

              /* Brand col */
              '<div class="footer-brand">' +
                '<a href="index.html" class="logo" style="margin-bottom:12px">' +
                  '<img src="edutrack-logo.jpg" alt="EduTrack Education Solution" class="logo-img" style="height:58px;filter:brightness(1.08) drop-shadow(0 2px 12px rgba(245,166,35,.4));" loading="lazy">' +
                '</a>' +
                '<p class="footer-desc">Nagpur\'s trusted <strong style="color:var(--teal-lt)">NEET UG &amp; NEET PG</strong> medical admission counselling. 3,500+ students guided. Transparent, ethical, data-driven guidance for your medical career.</p>' +
                '<div class="footer-social">' +
                  '<a class="fsoc" href="#" aria-label="YouTube" title="YouTube">▶</a>' +
                  '<a class="fsoc" href="https://wa.me/918484098904" target="_blank" aria-label="WhatsApp" title="WhatsApp">💬</a>' +
                  '<a class="fsoc" href="#" aria-label="Telegram" title="Telegram">✈</a>' +
                  '<a class="fsoc" href="#" aria-label="Instagram" title="Instagram">📸</a>' +
                '</div>' +
              '</div>' +

              /* NEET UG col */
              '<div class="footer-col">' +
                '<h5>NEET UG</h5>' +
                '<nav class="footer-links" aria-label="NEET UG pages">' +
                  '<a href="after12th.html">📚 After 12th Guide</a>' +
                  '<a href="counselling-ug.html">📋 UG Counselling Process</a>' +
                  '<a href="institutes.html">🏛️ Institutes &amp; Fees</a>' +
                  '<a href="mbbsabroad.html">🌍 MBBS Abroad</a>' +
                  '<a href="nri-quota.html">🌍 NRI Quota</a>' +
                  '<a href="institutional-quota.html">🏛️ IQ Seats</a>' +
                  '<a href="cutoff.html">📈 Cutoff Data</a>' +
                          '</nav>' +
              '</div>' +

              /* NEET PG col */
              '<div class="footer-col">' +
                '<h5>NEET PG</h5>' +
                '<nav class="footer-links" aria-label="NEET PG pages">' +
                  '<a href="afterdegree.html">🎓 After MBBS Guide</a>' +
                  '<a href="inicet.html">🏛️ INI-CET Guide</a>' +
                  '<a href="afterdegree.html#aiapget">🌿 AIAPGET (AYUSH PG)</a>' +
                  '<a href="cutoff.html#pg">📈 PG Cutoff Data</a>' +
                  '<a href="webinar.html">📺 Webinars &amp; Prime</a>' +
                          '</nav>' +
              '</div>' +

              /* Contact col */
              '<div class="footer-col">' +
                '<h5>Quick Connect</h5>' +
                '<p style="color:rgba(255,255,255,.45);font-size:13px;margin-bottom:14px;line-height:1.65">Call or WhatsApp for fast, personalised NEET guidance.</p>' +
                '<div class="footer-cta-col">' +
                  '<a href="contact.html" class="btn btn-primary btn-sm">📋 Book Free Session</a>' +
                  '<a href="tel:8484098904" class="btn btn-outline-white btn-sm">📞 8484098904</a>' +
                  '<a href="https://wa.me/918484098904" class="btn btn-wa btn-sm" target="_blank">💬 WhatsApp Now</a>' +
                  '<a href="login.html" class="btn btn-outline-white btn-sm">👤 Student Login</a>' +
                  '<a href="admin.html" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.2)">🔐 Counsellor Login</a>' +
                '</div>' +
                '<div style="margin-top:16px;padding:14px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(255,255,255,.07)">' +
                  '<p style="color:rgba(255,255,255,.5);font-size:12px;line-height:1.75">' +
                    '📍 Office No. 113/114, Jalaram Mangalam,<br>' +
                    'Opp. Mahindra Tractor Co.,<br>' +
                    'Hingna Road – 440016, Nagpur<br><br>' +
                    '📞 8484098904 &nbsp;|&nbsp; 8080901797<br>' +
                    '✉️ edutracksolution@gmail.com' +
                  '</p>' +
                '</div>' +
              '</div>' +

            '</div>' +
          '</div>' +
        '</div>' +

        /* Footer bottom */
        '<div class="footer-bottom">' +
          '<div class="wrap" style="width:100%">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">' +
              '<p>© 2026 EduTrack Education Solution, Nagpur. All rights reserved.</p>' +
              '<nav class="footer-bottom-links" aria-label="Legal">' +
                '<a href="privacy.html">Privacy Policy</a>' +
                '<a href="services.html">Services</a>' +
                '<a href="contact.html">Contact</a>' +
                '<a href="admin.html">🔐 Counsellor Login</a>' +
              '</nav>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>' +

      /* WHATSAPP FLOAT BUTTON */
      '<a class="wa-float" href="https://wa.me/918484098904" target="_blank" aria-label="Chat on WhatsApp" rel="noopener">' +
        '<span class="wa-float-tooltip">Chat with us!</span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
      '</a>' +

      /* MOBILE BOTTOM BAR */
      '<div class="mobile-bar" role="navigation" aria-label="Mobile quick actions">' +
        '<div class="mobile-bar-inner">' +
          '<a href="tel:8484098904" class="btn btn-outline-vio" aria-label="Call EduTrack">📞 Call</a>' +
          '<a href="https://wa.me/918484098904" class="btn btn-wa" target="_blank" rel="noopener" aria-label="WhatsApp EduTrack">💬 WhatsApp</a>' +
          '<a href="cutoff.html" class="btn btn-outline-vio" aria-label="Cutoff Data">📈 Cutoff</a>' +
          '<a href="contact.html" class="btn btn-primary" aria-label="Book Free Session">📋 Book</a>' +
        '</div>' +
      '</div>';
  }

  /* ══ 5. FAQ ACCORDION ════════════════════════════════════ */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq');
      document.querySelectorAll('.faq.open').forEach(f => {
        if (f !== item) f.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });

  /* ══ 6. RESULTS FILTER ═══════════════════════════════════ */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      document.querySelectorAll('.testi[data-type]').forEach(card => {
        card.style.display = (!filter || filter === 'all' || card.dataset.type === filter) ? '' : 'none';
      });
    });
  });

  /* ══ 7. BACK TO TOP ══════════════════════════════════════ */
  const btt = document.createElement('button');
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '↑';
  btt.style.cssText =
    'position:fixed;bottom:96px;right:22px;z-index:500;' +
    'width:44px;height:44px;border-radius:50%;' +
    'background:var(--white);color:var(--violet);' +
    'border:2px solid var(--border);font-size:18px;font-weight:900;' +
    'box-shadow:var(--sh-md);cursor:pointer;' +
    'opacity:0;transform:translateY(10px);' +
    'transition:opacity .22s,transform .22s;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:var(--font-h);line-height:1;';
  document.body.appendChild(btt);
  let bttVisible = false;
  window.addEventListener('scroll', function () {
    const show = window.scrollY > 600;
    if (show !== bttVisible) {
      bttVisible = show;
      btt.style.opacity = show ? '1' : '0';
      btt.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
    }
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ══ 8. SCROLL-AWARE NAV ══════════════════════════════════ */
  const navEl2 = document.querySelector('.nav');
  if (navEl2) {
    window.addEventListener('scroll', function () {
      navEl2.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

});
