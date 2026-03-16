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

  /* ── 3. Global: Logo (every page) ──────────────────────── */
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
      <div class="svc-card reveal">
        <div class="svc-front">
          <div class="svc-front-img"><img src="images/aone-hero.jpg" alt="${s.name}"></div>
          <div class="svc-front-info">
            <div class="svc-icon">${s.icon}</div>
            <div class="svc-name">${s.name}</div>
            <div class="svc-price">${s.price}</div>
          </div>
        </div>
        <div class="svc-back">
          <div class="svc-icon">${s.icon}</div>
          <div class="svc-name">${s.name}</div>
          <div class="svc-price">${s.price}</div>
          <a href="booking.html" class="btn-svc-book">Book Now</a>
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
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"${t.text}"</p>
        <div class="testi-author">
          <div class="testi-avatar">${t.initial}</div>
          <div>
            <div class="testi-name">${t.name}</div>
            <div class="testi-loc">${t.location}</div>
          </div>
        </div>
      </div>`).join('');
    reObserve(testiWrap);
  }

  /* ══════════════════════════════════════════════════════════
     9. SERVICES PAGE — rebuild category tables
  ══════════════════════════════════════════════════════════ */
  const svcWrap = document.getElementById('cmsSvcCategories');
  if (svcWrap && C.services_page && Array.isArray(C.services_page.categories)) {
    svcWrap.innerHTML = C.services_page.categories.map(cat => {
      const rows = cat.items.map(item => `
        <tr>
          <td class="svc-name-cell">
            <div class="svc-row-name">${item.name}</div>
            <div class="svc-row-detail">${item.detail}</div>
          </td>
          <td class="svc-dur">${item.duration}</td>
          <td class="svc-price-cell">${item.price}</td>
        </tr>`).join('');
      return `
        <div class="svc-category reveal" data-id="${cat.id}">
          <div class="cat-header">
            <h2 class="cat-title">${cat.title}</h2>
            <p class="cat-desc">${cat.desc}</p>
          </div>
          <div class="svc-table-wrap">
            <table class="svc-table">
              <thead><tr><th>Service</th><th>Duration</th><th>Price</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    }).join('');
    reObserve(svcWrap);
  }

  /* ══════════════════════════════════════════════════════════
     10. BOOKING PAGE — rebuild service pick cards
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
     11. BOOKING PAGE — rebuild stylist chips
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
