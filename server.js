const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app           = express();
const PORT          = process.env.PORT || 3000;
const ADMIN_KEY     = 'aone-salon-admin-2024';           // shared with admin pages
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

/* ── Parse JSON bodies ── */
app.use(express.json());

/* ── Serve static files ── */
app.use(express.static(path.join(__dirname), {
  etag: false,
  maxAge: 0,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('content.json')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
  }
}));

/* ── Bookings helpers ── */
function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
  } catch(e) { return []; }
}

function writeBookings(data) {
  try { fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2), 'utf8'); }
  catch(e) { console.error('Error writing bookings:', e.message); }
}

function isAdmin(req) {
  return req.headers['x-admin-key'] === ADMIN_KEY;
}

/* ── POST /api/booking — create new booking ── */
app.post('/api/booking', (req, res) => {
  const b = req.body;
  if (!b || !b.id || !b.fname || !b.svc) {
    return res.status(400).json({ error: 'Missing required fields (id, fname, svc)' });
  }
  const bookings = readBookings();
  /* Prevent duplicate IDs */
  if (bookings.find(x => x.id === b.id)) {
    return res.status(409).json({ error: 'Booking ID already exists' });
  }
  const booking = {
    id:        b.id,
    svc:       b.svc       || '',
    price:     b.price     || '',
    stylist:   b.stylist   || '',
    date:      b.date      || '',
    time:      b.time      || '',
    fname:     b.fname,
    lname:     b.lname     || '',
    email:     b.email     || '',
    mobile:    b.mobile    || '',
    notes:     b.notes     || '',
    status:    'pending',
    timestamp: new Date().toISOString(),
    updated:   new Date().toISOString()
  };
  bookings.unshift(booking);
  writeBookings(bookings);
  console.log(`[BOOKING] New: ${booking.id} | ${booking.fname} ${booking.lname} | ${booking.svc} | ${booking.date} ${booking.time}`);
  res.json({ success: true, booking });
});

/* ── GET /api/bookings — list all bookings (admin only) ── */
app.get('/api/bookings', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const all     = readBookings();
  const status  = req.query.status;
  const result  = status ? all.filter(b => b.status === status) : all;
  res.json(result);
});

/* ── GET /api/booking/:id — get single booking (admin only) ── */
app.get('/api/booking/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const b = readBookings().find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  res.json(b);
});

/* ── PATCH /api/booking/:id — update status/date/time/stylist/notes ── */
app.patch('/api/booking/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const bookings = readBookings();
  const idx      = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  const allowed = ['status', 'date', 'time', 'stylist', 'notes'];
  allowed.forEach(k => { if (req.body[k] !== undefined) bookings[idx][k] = req.body[k]; });
  bookings[idx].updated = new Date().toISOString();
  writeBookings(bookings);
  console.log(`[BOOKING] Updated: ${req.params.id} → status=${bookings[idx].status}`);
  res.json({ success: true, booking: bookings[idx] });
});

/* ── DELETE /api/booking/:id — delete booking (admin only) ── */
app.delete('/api/booking/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const bookings = readBookings();
  const idx      = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  const removed = bookings.splice(idx, 1);
  writeBookings(bookings);
  console.log(`[BOOKING] Deleted: ${req.params.id}`);
  res.json({ success: true, removed: removed[0] });
});

/* ── Fallback: serve index.html for any non-API unknown route ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`A One Hair Salon running on port ${PORT}`);
});
