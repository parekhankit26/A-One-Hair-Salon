/* ═══════════════════════════════════════════════════════════
   CMS.JS  —  A One Hair Salon  —  Dynamic Content Loader
   Fetches content.json and patches all pages automatically.
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

  /* ── 2. Helpers ────────────────────────────────────────── */
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

  /* ── 3. Global: Logo (every page) ─────────────────────── */
  if (C.site) {
    setText('.logo-main', C.site.name);
    setText('.logo-sub',  C.site.tagline);
  }

  /* ── 4. Patch all [data-cms] elements ──────────────────── */
  document.querySelectorAll('[data-cms]').forEach(el => {
    const val = get(el.getAttribute('data-cms'));
    if (val != null) el.textContent = String(val);
  });

  /* ── 5. Booking page: rebuild service pick cards ────────── */
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

    /* Re-attach click events after rebuild */
    bookGrid.querySelectorAll('.svc-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        bookGrid.querySelectorAll('.svc-pick-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (window.B) {
          window.B.svc   = card.dataset.svc;
          window.B.price = card.dataset.price;
        }
        const n1 = document.getElementById('next1');
        if (n1) n1.disabled = false;
      });
    });

    /* Cursor expand for new cards */
    if (window.__aoneExpandCursor) {
      bookGrid.querySelectorAll('.svc-pick-card').forEach(el => {
        el.addEventListener('mouseenter', () => window.__aoneExpandCursor(true));
        el.addEventListener('mouseleave', () => window.__aoneExpandCursor(false));
      });
    }
  }

  /* ── 6. Expose content globally for admin preview ────────── */
  window.AONE_CONTENT = C;

})();
