/* ═══════════════════════════════════════════════════════════
   CMS.JS  —  A One Hair Salon  —  Full Dynamic Content Loader
   Version 2.0 — Complete coverage of all pages
   Add  <script src="cms.js"></script>  before </body> on every page.
   ═══════════════════════════════════════════════════════════ */

(async function AoneCMS() {

  /* ── 1. Load content.json ──────────────────────────────── */
  let C = {};
  try {
    const r = await fetch('./content.json?v=' + Date.now());
    if (r.ok) C = await r.json();
    else return;
  } catch (e) { return; }

  /* ── 2. Helpers ─────────────────────────────────────────── */
  function get(path) {
    return path.split('.').reduce((o, k) => {
      if (o == null) return undefined;
      const n = parseInt(k);
      return isNaN(n) ? o[k] : o[n];
    }, C);
  }
  function setText(sel, val) {
    if (val == null || val === '') return;
    document.querySelectorAll(sel).forEach(el => el.textContent = String(val));
  }
  function reObserve(parent) {
    if (!parent) return;
    if (window._cmsRevealObserver) {
      parent.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => {
        el.classList.remove('visible');
        window._cmsRevealObserver.observe(el);
      });
    }
  }

  /* ── 3. Marquee strip ──────────────────────────────────── */
  const marqueeTrack = document.getElementById('cmsMarqueeTrack');
  if (marqueeTrack && Array.isArray(C.marquee) && C.marquee.length > 0) {
    const doubled = [...C.marquee, ...C.marquee];
    marqueeTrack.innerHTML = doubled.map(item =>
      `<span>${item}</span><span class="dot">✦</span>`
    ).join('');
  }

  /* ── 3b. About section — stat counters & images ─────────── */
  const aboutStats = [
    { id: 'cmsAboutStat1', key: 'home.about_stat1_num' },
    { id: 'cmsAboutStat2', key: 'home.about_stat2_num' },
    { id: 'cmsAboutStat3', key: 'home.about_stat3_num' },
  ];
  aboutStats.forEach(function(s) {
    const el = document.getElementById(s.id);
    if (!el) return;
    const raw = get(s.key);
    if (raw == null) return;
    const numVal = parseInt(String(raw).replace(/[^0-9]/g, '')) || 0;
    el.setAttribute('data-target', numVal);
    el.textContent = numVal >= 1000 ? (numVal / 1000).toFixed(1) + 'k+' : numVal + (numVal > 8 ? '+' : '');
  });

  /* ── 3d. Global: Logo (every page) ─────────────────────── */
  if (C.site) {
    setText('.logo-main', C.site.name);
    setText('.logo-sub',  C.site.tagline);
  }

  /* ── 4. Patch all [data-cms] text elements ─────────────── */
  document.querySelectorAll('[data-cms]').forEach(el => {
    const val = get(el.getAttribute('data-cms'));
    if (val != null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = String(val);
      else if (el.tagName === 'IFRAME') el.src = String(val);
      else el.textContent = String(val);
    }
  });

  /* ── 4b. Patch booking confirmation message ─────────────── */
  if (C.booking) {
    if (C.booking.confirm_title) {
      document.querySelectorAll('[data-cms="booking.confirm_title"]').forEach(el => { el.textContent = C.booking.confirm_title; });
    }
    if (C.booking.confirm_text) {
      document.querySelectorAll('[data-cms="booking.confirm_text"]').forEach(el => { el.textContent = C.booking.confirm_text; });
    }
  }

  /* ── 5. Patch [data-cms-src] for iframes / img src ─────── */
  document.querySelectorAll('[data-cms-src]').forEach(el => {
    const val = get(el.getAttribute('data-cms-src'));
    if (val != null) el.src = String(val);
  });

  /* ── 6. Page <title> ────────────────────────────────────── */
  const sn   = (C.site && C.site.name) || 'A ONE Hair Salon';
  const page = location.pathname.split('/').pop() || 'index.html';
  const pageTitles = {
    'index.html':    sn + ' — Luxury Unisex Salon',
    'services.html': (C.pages && C.pages.services && C.pages.services.hero_title ? C.pages.services.hero_title : 'Services') + ' — ' + sn,
    'gallery.html':  (C.pages && C.pages.gallery  && C.pages.gallery.hero_title  ? C.pages.gallery.hero_title  : 'Gallery')  + ' — ' + sn,
    'contact.html':  (C.pages && C.pages.contact  && C.pages.contact.hero_title  ? C.pages.contact.hero_title  : 'Contact')  + ' — ' + sn,
    'booking.html':  'Book Appointment — ' + sn,
  };
  if (pageTitles[page]) document.title = pageTitles[page];

  /* ══════════════════════════════════════════════════════════
     7. HOME PAGE — Signature Services
  ══════════════════════════════════════════════════════════ */
  const sigWrap = document.getElementById('cmsSignatureServices');
  if (sigWrap && Array.isArray(C.services)) {
    sigWrap.innerHTML = C.services.map(s => `
      <div class="svc-card reveal visible">
        <div class="svc-card-inner">
          <div class="svc-front">
            <div class="svc-front-img"><img src="${s.image || 'images/aone-hero.jpg'}" alt="${s.name}"></div>
            <div class="svc-front-info">
              <h3>${s.name}</h3>
              <p>${s.price}</p>
            </div>
          </div>
          <div class="svc-back">
            <div class="svc-back-icon">${s.icon}</div>
            <h3>${s.name}</h3>
            ${s.detail ? `<p>${s.detail}</p>` : ''}
            <div class="price-tag">${s.price}</div>
            <a href="booking.html" style="margin-top:8px;padding:10px 24px;background:linear-gradient(135deg,var(--gold),var(--gold-dk));color:var(--bg);font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;text-decoration:none">Book Now</a>
            <div class="svc-hint">Hover to flip · Click to book</div>
          </div>
        </div>
      </div>`).join('');
    reObserve(sigWrap);
  }

  /* ══════════════════════════════════════════════════════════
     8. HOME PAGE — Testimonials
  ══════════════════════════════════════════════════════════ */
  const testiWrap = document.getElementById('cmsTestimonials');
  if (testiWrap && Array.isArray(C.testimonials)) {
    testiWrap.innerHTML = C.testimonials.map(t => `
      <div class="testi-card reveal visible">
        <div class="testi-quote">"</div>
        <div class="stars">★★★★★</div>
        <p class="testi-text">${t.text}</p>
        <div class="testi-author">
          <div class="testi-avatar" style="${t.photo ? 'padding:0;overflow:hidden;' : ''}">${t.photo ? `<img src="${t.photo}" alt="${t.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : t.initial}</div>
          <div>
            <div class="testi-name">${t.name}</div>
            <div class="testi-loc">${t.location}</div>
          </div>
        </div>
      </div>`).join('');
    reObserve(testiWrap);
  }

  /* ══════════════════════════════════════════════════════════
     9. HOME PAGE — Gallery Grid
  ══════════════════════════════════════════════════════════ */
  const galleryWrap = document.getElementById('cmsGalleryGrid');
  if (galleryWrap && Array.isArray(C.gallery_items) && C.gallery_items.length > 0) {
    const delays = ['', 'style="transition-delay:.08s"', 'style="transition-delay:.16s"',
                    'style="transition-delay:.08s"', 'style="transition-delay:.16s"', 'style="transition-delay:.24s"'];
    galleryWrap.innerHTML = C.gallery_items.map((item, i) =>
      '<div class="g-item reveal visible" ' + (delays[i] || '') + '>' +
      '<img src="' + (item.image || 'images/aone-hero.jpg') + '" alt="' + item.label + '">' +
      '<div class="g-overlay"><span>' + item.label + '</span></div>' +
      '</div>'
    ).join('');
    galleryWrap.querySelectorAll('.g-item').forEach(function(el) {
      el.addEventListener('click', function() { window.location.href = 'gallery.html'; });
    });
  }

  /* ══════════════════════════════════════════════════════════
     10. SERVICES PAGE — rebuild category tables
  ══════════════════════════════════════════════════════════ */
  const catIcons = {hair:'✂',color:'◉',bridal:'♛',grooming:'✦',skin:'✿',nails:'◆',treatments:'◈',makeup:'❋'};
  const svcWrap = document.getElementById('cmsSvcCategories');
  if (svcWrap && C.services_page && Array.isArray(C.services_page.categories)) {
    svcWrap.innerHTML = C.services_page.categories.map(cat => {
      const icon = catIcons[cat.id] || '✦';
      const rows = cat.items.map(item => `
        <div class="svc-row">
          <div>
            <div class="svc-name">${item.name}</div>
            <div class="svc-detail">${item.detail}</div>
          </div>
          <div class="svc-duration">${item.duration}<span>duration</span></div>
          <div class="svc-price-cell"><div class="svc-price">${item.price}</div></div>
          <a href="booking.html" class="svc-book-btn">Book Now</a>
        </div>`).join('');
      return `
        <div class="svc-category reveal visible" data-cat="${cat.id}">
          <div class="cat-header">
            <div class="cat-icon">${icon}</div>
            <div class="cat-info">
              <h2>${cat.title}</h2>
              <p>${cat.desc}</p>
            </div>
            <div class="cat-line"></div>
          </div>
          <div class="cat-photo-banner">
            <img src="${cat.banner_image || 'images/aone-hero.jpg'}" alt="${cat.title}">
            <div class="cat-photo-label">
              <h3>${cat.title}</h3>
              <p>${cat.desc}</p>
            </div>
          </div>
          <div class="svc-table">${rows}</div>
        </div>`;
    }).join('');
    reObserve(svcWrap);
  }

  /* ══════════════════════════════════════════════════════════
     11. BOOKING PAGE — rebuild service pick cards
  ══════════════════════════════════════════════════════════ */
  const bookGrid = document.getElementById('cmsBookingServices');
  if (bookGrid && Array.isArray(C.services)) {
    bookGrid.innerHTML = C.services.map(s =>
      `<div class="svc-pick-card" data-svc="${s.name}" data-price="${s.price}">
        <div class="spk-icon">${s.icon}</div>
        <div class="spk-name">${s.name}</div>
        <div class="spk-price">${s.price}</div>
        <div class="spk-check">&#10003;</div>
      </div>`
    ).join('');

    bookGrid.querySelectorAll('.svc-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        bookGrid.querySelectorAll('.svc-pick-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (window.B) { window.B.svc = card.dataset.svc; window.B.price = card.dataset.price; }
        const n1 = document.getElementById('next1');
        if (n1) n1.disabled = false;
      });
    });

    if (window.__aoneExpandCursor) {
      bookGrid.querySelectorAll('.svc-pick-card').forEach(el => {
        el.addEventListener('mouseenter', () => window.__aoneExpandCursor(true));
        el.addEventListener('mouseleave', () => window.__aoneExpandCursor(false));
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     12. BOOKING PAGE — rebuild stylist chips
  ══════════════════════════════════════════════════════════ */
  const stylistWrap = document.getElementById('cmsStylists');
  if (stylistWrap && C.booking && Array.isArray(C.booking.stylists)) {
    stylistWrap.innerHTML = C.booking.stylists.map((st, i) => `
      <div class="stylist-chip${i === 0 ? ' selected' : ''}" data-stylist="${st.name}">
        <span class="sc-name">${st.name}</span>
        <span class="sc-spec">${st.specialty}</span>
      </div>`).join('');

    stylistWrap.querySelectorAll('.stylist-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        stylistWrap.querySelectorAll('.stylist-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        if (window.B) window.B.stylist = chip.dataset.stylist;
        const el = document.getElementById('summaryStylist');
        if (el) el.textContent = chip.dataset.stylist;
      });
    });
  }

  /* ── 12. Expose content globally ───────────────────────── */
  window.AONE_CONTENT = C;

})();
