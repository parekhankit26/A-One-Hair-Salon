# A One Hair Salon — Website

A complete, fully dynamic multi-page website for **A One Hair Salon, Mumbai**.
Built with GSAP animations, 3D CSS effects, live booking system (localStorage), EmailJS confirmations, WhatsApp SMS, and a full admin dashboard.

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Homepage — 3D photo carousel, hero animations, service cards, gallery preview |
| `services.html` | Services & Pricing — filterable categories, photo banners, package cards |
| `gallery.html` | Photo Gallery — 12 Canva images, masonry/grid/list view, lightbox |
| `booking.html` | 5-step booking form — live calendar, EmailJS confirmation, WhatsApp SMS |
| `contact.html` | Contact page — info cards, animated map, contact form |
| `admin.html` | Admin Dashboard — bookings, services editor, gallery manager, settings |

---

## Deploy to GitHub Pages (Step-by-Step)

### Step 1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click the **+** button (top right) → **New repository**
3. Name it: `a-one-hair-salon` (or any name you like)
4. Set it to **Public**
5. Leave everything else as default → click **Create repository**

### Step 2 — Upload the Website Files

**Option A — Upload via GitHub website (easiest):**

1. On your new repo page, click **uploading an existing file** (or drag and drop)
2. Select ALL the files from this folder:
   - `index.html`, `services.html`, `gallery.html`, `booking.html`, `contact.html`, `admin.html`
   - `site.js`
   - `404.html`
   - `.nojekyll`
   - The `.github/` folder (with `workflows/deploy.yml` inside)
3. Scroll down → click **Commit changes**

> **Important:** Make sure `.nojekyll` and the `.github/workflows/deploy.yml` file are included.

**Option B — Using Git (command line):**

```bash
git init
git add .
git commit -m "Initial website upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/a-one-hair-salon.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. In your repository, go to **Settings** (top tab)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. The site will automatically deploy via the workflow file

### Step 4 — Your Website is Live!

After 1–2 minutes, your site will be live at:

```
https://YOUR_USERNAME.github.io/a-one-hair-salon/
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Auto-Update (GitHub Actions)

Every time you push changes to the `main` branch, the site automatically rebuilds and deploys. No manual steps needed.

The workflow is defined in `.github/workflows/deploy.yml`.

---

## Admin Dashboard

Access the admin panel at: `https://YOUR_USERNAME.github.io/a-one-hair-salon/admin.html`

**Default login credentials:**
- Username: `admin`
- Password: `salon2026`

> Change these immediately in **Admin → Settings** after first login.

### What you can manage from Admin:
- **Bookings** — view, search, and cancel customer bookings
- **Services** — edit service names, prices, and descriptions
- **Gallery** — add or remove photos (paste any image URL or Canva link)
- **Settings** — salon name, phone, email, address, business hours
- **Email Setup** — step-by-step guide to connect EmailJS for booking confirmations

---

## EmailJS Setup (Booking Confirmations)

1. Sign up free at [emailjs.com](https://www.emailjs.com)
2. Connect your Gmail (or any email)
3. Create an email template with these variables:
   - `{{to_email}}`, `{{to_name}}`, `{{service}}`, `{{date}}`, `{{time}}`, `{{booking_id}}`
4. Copy your **Service ID**, **Template ID**, and **Public Key**
5. Go to **Admin → Email Setup** and enter these values

---

## WhatsApp Booking Confirmation

After a booking is confirmed, customers get a WhatsApp button that sends a pre-filled confirmation message to the salon's WhatsApp number.

Update the phone number in `booking.html` — search for `wa.me/91` and replace with your number.

---

## Tech Stack

- **HTML5 / CSS3** — Custom properties, CSS Grid, Flexbox, 3D transforms
- **GSAP 3.12.2 + ScrollTrigger** — Scroll animations and parallax
- **localStorage** — Client-side data persistence for bookings and settings
- **EmailJS** — No-backend email confirmations
- **Canva** — All photography generated via Canva AI
- **GitHub Pages + GitHub Actions** — Free static hosting with auto-deploy

---

*Crafted with ✦ for A One Hair Salon, Mumbai*
