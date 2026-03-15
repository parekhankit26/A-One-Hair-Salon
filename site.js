/**
 * A One Hair Salon -- Shared Site Engine
 * - Smooth page transitions (gold curtain)
 * - Dynamic content from localStorage (admin-managed)
 * - Shared cursor
 * - Shared nav scroll
 */

(function () {
  'use strict';

  /* ============================================================
     1. PAGE TRANSITIONS -- Gold curtain slide
  ============================================================ */
  const TRANSITION_MS = 480;

  function createTransitionEl() {
    const el = document.createElement('div');
    el.id = 'siteTransition';
    el.innerHTML = `
      <div class="st-curtain st-c1"></div>
      <div class="st-curtain st-c2"></div>
      <div class="st-logo">
        <div class="st-emblem">A</div>
      </div>`;
    const style = document.createElement('style');
    style.textContent = `
      #siteTransition {
        position: fixed; inset: 0; z-index: 999999;
        pointer-events: none; display: flex;
      }
      .st-curtain {
        flex: 1; height: 100%;
        transform: translateY(-102%);
        transition: transform ${TRANSITION_MS}ms cubic-bezier(.77,0,.18,1);
      }
      .st-c1 { background: #c9a84c; transition-delay: 0ms; }
      .st-c2 { background: #08080a; transition-delay: 40ms; }
      .st-logo {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0; transition: opacity 0.3s;
      }
      .st-emblem {
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #f0d47a, #c9a84c, #8a6f2e);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; color: #08080a; font-weight: 900;
        font-family: 'Cormorant Garamond', serif;
        box-shadow: 0 0 40px rgba(201,168,76,.6);
      }
      #siteTransition.entering .st-curtain { transform: translateY(0) !important; }
      #siteTransition.entering .st-logo   { opacity: 1; }
      #siteTransition.leaving  .st-curtain { transform: translateY(102%) !important; }
      #siteTransition.leaving  .st-logo   { opacity: 0; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(el);
    return el;
  }

  let transEl;

  function pageEnter() {
    // Slide curtain UP (away) to reveal page
    transEl.classList.remove('entering');
    transEl.classList.add('leaving');
    setTimeout(() => {
      transEl.style.pointerEvents = 'none';
      transEl.classList.remove('leaving');
    }, TRANSITION_MS + 100);
  }

  function pageExit(href) {
    // Slide curtain DOWN (covering page)
    transEl.style.pointerEvents = 'all';
    transEl.classList.remove('leaving');
    transEl.classList.add('entering');
    setTimeout(() => {
      window.location.href = href;
    }, TRANSITION_MS + 60);
  }

  function initTransitions() {
    transEl = createTransitionEl();
    // Start covering, then reveal
    transEl.classList.add('entering');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { pageEnter(); });
    });

    // Intercept all internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href ||
          href.startsWith('#') ||
          href.startsWith('http') ||
          href.startsWith('mailto') ||
          href.startsWith('tel') ||
          href.startsWith('javascript') ||
          link.target === '_blank') return;
      e.preventDefault();
      pageExit(href);
    });
  }

  /* ============================================================
     2. DYNAMIC CONTENT -- Load from localStorage (admin-managed)
  ============================================================ */
  const STORE = {
    get: (key, fallback) => {
      try {
        const v = localStorage.getItem('salon_' + key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    },
    set: (key, val) => {
      try { localStorage.setItem('salon_' + key, JSON.stringify(val)); } catch (e) {}
    }
  };

  /* Apply salon settings to page (name, tagline, phone, etc.) */
  function applySettings() {
    const settings = STORE.get('settings', null);
    if (!settings) return;
    if (settings.salonName) {
      document.querySelectorAll('[data-dyn="salon-name"]').forEach(el => el.textContent = settings.salonName);
    }
    if (settings.phone) {
      document.querySelectorAll('[data-dyn="phone"]').forEach(el => el.textContent = settings.phone);
    }
    if (settings.email) {
      document.querySelectorAll('[data-dyn="email"]').forEach(el => el.textContent = settings.email);
    }
    if (settings.address) {
      document.querySelectorAll('[data-dyn="address"]').forEach(el => el.textContent = settings.address);
    }
    if (settings.tagline) {
      document.querySelectorAll('[data-dyn="tagline"]').forEach(el => el.textContent = settings.tagline);
    }
  }

  /* Apply dynamic services on services.html */
  function applyServices() {
    const services = STORE.get('services', null);
    if (!services || !services.length) return;
    const rows = document.querySelectorAll('.svc-row[data-svc-id]');
    rows.forEach(row => {
      const id = row.dataset.svcId;
      const svc = services.find(s => s.id === id);
      if (!svc) return;
      const nameEl = row.querySelector('.svc-name');
      const priceEl = row.querySelector('.svc-price');
      const detailEl = row.querySelector('.svc-detail');
      if (nameEl) nameEl.textContent = svc.name;
      if (priceEl) priceEl.innerHTML = svc.price + ' <small>' + (svc.priceNote || 'onwards') + '</small>';
      if (detailEl) detailEl.textContent = svc.detail || '';
    });
  }

  /* ============================================================
     3. SAVE BOOKING
  ============================================================ */
  window.SalonDB = {
    saveBooking: function (booking) {
      const bookings = STORE.get('bookings', []);
      booking.id = '#AOH-' + Math.floor(Math.random() * 90000 + 10000);
      booking.timestamp = new Date().toISOString();
      booking.status = 'confirmed';
      bookings.unshift(booking);
      STORE.set('bookings', bookings);
      return booking.id;
    },
    getBookings: () => STORE.get('bookings', []),
    getSettings: () => STORE.get('settings', {}),
    getServices: () => STORE.get('services', []),
    saveSettings: (s) => STORE.set('settings', s),
    saveServices: (s) => STORE.set('services', s)
  };

  /* ============================================================
     4. INIT
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initTransitions();
    applySettings();
    applyServices();
  }

})();
