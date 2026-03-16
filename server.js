const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Serve all static files (HTML, CSS, JS, images, JSON) ── */
app.use(express.static(path.join(__dirname), {
  etag: false,
  maxAge: 0,
  setHeaders: (res, filePath) => {
    /* Never cache content.json so admin changes go live instantly */
    if (filePath.endsWith('content.json')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
  }
}));

/* ── Fallback: serve index.html for any unknown route ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`A One Hair Salon running on port ${PORT}`);
});
