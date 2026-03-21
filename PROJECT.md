# Miphotography — Project Documentation

## Overview

A full-stack photography business platform built for **Miphotography**. It includes a public-facing portfolio website, an online booking system, a client gallery portal, and a complete admin dashboard — all in one Next.js application deployed on Cloudflare Pages.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.5.10 |
| Language | TypeScript | — |
| Styling | Tailwind CSS v4 | — |
| Deployment | Cloudflare Pages (`@opennextjs/cloudflare`) | — |
| Auth | Firebase Auth (client) + firebase-admin (server) | 12.x / 13.x |
| Database | Airtable | — |
| Image Storage | Cloudinary | 2.x |
| Email | Resend | 6.x |
| Calendar | Google Calendar API | via googleapis |
| Edge JWT | JOSE | 6.x |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public website (portfolio, booking, about, contact)
│   ├── (admin)/admin/     # Admin dashboard (protected: role=admin)
│   ├── (client)/client/   # Client portal (protected: role=client)
│   ├── login/             # Login / register / forgot password
│   ├── api/               # API routes
│   │   ├── auth/          # Session, register, forgot-password, send-invite
│   │   └── admin/         # Admin-only CRUD (galleries, staff, content, settings, inquiries)
│   └── layout.tsx         # Root layout with AuthProvider
├── components/
│   └── layout/            # Navbar, Footer, AdminSidebar
├── contexts/
│   └── AuthContext.tsx    # Firebase auth + session sync + localStorage cache
├── lib/
│   ├── airtable.ts        # Airtable client, types, CRUD helpers
│   ├── firebase.ts        # Firebase client SDK
│   ├── firebase-admin.ts  # Firebase Admin (invite links, password reset)
│   ├── firebase-verify.ts # Edge-compatible JWT verifier + requireAdmin()
│   ├── cloudinary.ts      # Upload + URL helpers
│   ├── email.ts           # Resend email client + all templates
│   └── calendar.ts        # Google Calendar event create/delete
├── middleware.ts           # Edge middleware: route protection by cookie
└── types/index.ts          # Shared TypeScript types
```

---

## Authentication Flow

1. User visits `/login`
2. Signs in with **Google** (`signInWithPopup`) or **email + password**
3. Firebase issues an ID token → sent to `POST /api/auth/session`
4. Server verifies token (JOSE, edge-compatible), looks up user in Airtable
5. Sets two cookies:
   - `__session` — Firebase ID token (httpOnly, 7 days)
   - `__role` — `"admin"` or `"client"` (for middleware fast-check)
6. Login page waits for `sessionVerified` (server-confirmed role) before redirecting
7. Admin → `/admin`, Client → `/client`

**Middleware** (`src/middleware.ts`) protects `/admin/*` and `/client/*` by checking `__session` and `__role` cookies — no database calls on every request.

**Session caching**: `sessionUser` is cached in `localStorage` for instant page loads. Background `syncSession` refreshes it. The login redirect waits for the server-verified role to prevent stale cache causing wrong redirects.

---

## Role System

Roles are stored in the Airtable **Users** table (`role` field):

| Role | Access |
|---|---|
| `admin` | Full admin dashboard at `/admin` |
| `client` | Client gallery portal at `/client` |

To make someone an admin: update their `role` field to `admin` in Airtable's Users table, or use the **Staff** page in the admin dashboard.

---

## Admin Dashboard — Feature Guide

### Bookings (`/admin/bookings`)
- View all bookings in a clickable table
- Filter by status: Pending, Confirmed, Completed, Cancelled
- Sort by Newest / Oldest
- Click any row to open the booking detail
- In the detail: change status (Pending → Confirmed → Completed / Cancelled)
- Confirming a booking automatically creates a **Google Calendar event** and emails the client
- Cancelling removes the calendar event

### Client Galleries (`/admin/galleries`)

**To upload photos to a client:**
1. Go to **Galleries** in the sidebar
2. Click an existing gallery, or click **New Gallery** to create one
3. In the gallery detail page, use the **image uploader** section to drag-and-drop or select photos — they upload directly to Cloudinary
4. Once all photos are uploaded, click **Mark Ready + Notify Client** — this sends the client an email with a link to their gallery
5. Toggle **Enable Downloads** if you want the client to be able to download the full-resolution photos

**Status flow:** Processing → Ready → Archived

### Inquiries (`/admin/inquiries`)
- Filter by status: New, Read, Replied, Archived
- Click any inquiry to expand it and read the full message
- **Reply**: click the Reply button, type your message, click Send — the email goes directly to the client's inbox via Resend and the inquiry is marked "Replied"
- **Mark Read / Archive** buttons available when expanded
- "Open in email" opens your default mail app with the client's address pre-filled

### Clients (`/admin/clients`)
- Lists all registered client accounts
- Sort by Newest / Oldest / A–Z
- Shows booking count, gallery count, and last booking status per client
- Click a client to view their full profile, booking history, and galleries

### Content (`/admin/content`)
Three tabs — everything managed directly here, no Airtable visits needed:

**Packages & Pricing**
- Add, edit, delete session packages
- Fields: Name, Price, Duration, Description, Includes (what's in the package), Sort Order, Active toggle
- **Sort Order**: controls the order packages appear on the public website. Lower number = shown first. Set Package A to `1`, Package B to `2`, etc.
- Toggle **Show on website** to hide a package without deleting it

**Testimonials**
- Add, edit, delete client reviews shown on the homepage
- Fields: Client Name, Title/Context, Review text, Star rating, Sort Order, Published toggle
- **Sort Order**: same concept — lower number appears first on the homepage
- Toggle **Published** to temporarily hide a review

**Availability**
- Block date ranges so they appear as unavailable on the booking calendar
- Add a start date, end date, and optional internal reason (clients don't see the reason)
- Delete blocks when dates are available again

### Staff (`/admin/staff`)
- Lists all admin users
- Add a new staff member by name + email → they receive an invite email with a link to set their password
- Remove staff → demotes them to client role (they keep their account)

### Settings (`/admin/settings`)
Five tabs:

| Tab | What to set |
|---|---|
| Photographer Profile | Your name, tagline, and bio shown on the public about page |
| Contact Details | Business email and phone for the contact page |
| Social Media | Instagram handle and Facebook URL for footer links |
| Notifications | Email address where booking/inquiry alerts are sent |
| Booking Page | Intro text shown at the top of the public booking form |

---

## Portfolio / Public Gallery (`/admin/galleries` + Cloudinary)

**To add photos to the public portfolio page:**

The portfolio is managed through Airtable's **Portfolio Galleries** and **Portfolio Images** tables directly, or through the Content section if you build that UI. For now:

1. In Airtable, open the **Portfolio Galleries** table
2. Create a record: title, slug (URL-safe), category, `isPublished = true`
3. Upload the cover image to Cloudinary → copy the `public_id`
4. Paste the `public_id` into the `coverPublicId` field in Airtable
5. In the **Portfolio Images** table, add image records linked to the gallery (each with a Cloudinary `cloudinaryId`)

> A future improvement is to build a portfolio gallery manager in the admin dashboard similar to the client galleries manager.

---

## Email Templates

All emails are sent via **Resend** from `src/lib/email.ts`:

| Template | When sent |
|---|---|
| `bookingConfirmationEmail` | Client submits a booking request |
| `adminBookingNotificationEmail` | You receive a new booking alert |
| `galleryReadyEmail` | Client's gallery is marked Ready |
| `inquiryNotificationEmail` | You receive a new inquiry |
| `inquiryReplyEmail` | You reply to an inquiry from the admin panel |
| `inviteEmail` | New staff/client is invited to set a password |
| `passwordResetEmail` | User requests a password reset |

**From address**: set `EMAIL_FROM` in `.env.local`. For production, verify your domain at [resend.com/domains](https://resend.com/domains) to use your own address instead of `onboarding@resend.dev`.

---

## Environment Variables

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Airtable
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend (email)
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev   # replace with your verified domain

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_NAME=Miphotography
ADMIN_EMAIL=                        # your email for booking/inquiry notifications

# Google Calendar (optional)
GOOGLE_CALENDAR_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

---

## Airtable Tables

| Table | Purpose |
|---|---|
| `Users` | All user accounts (role: admin/client) |
| `Bookings` | Session booking requests |
| `Packages` | Session packages shown on public site |
| `Portfolio Galleries` | Public portfolio albums |
| `Portfolio Images` | Images inside portfolio albums |
| `Client Galleries` | Private galleries per client |
| `Gallery Images` | Photos inside client galleries |
| `Favorites` | Client image favorites |
| `Inquiries` | Contact form submissions |
| `Testimonials` | Client reviews |
| `Availability` | Blocked date ranges for booking calendar |
| `Settings` | Single-record photographer settings |

---

## Deployment (Cloudflare Pages)

1. Run `npm run build` — uses `@opennextjs/cloudflare`
2. Deploy via `wrangler pages deploy` or push to GitHub (auto-deploy if connected)
3. Set all environment variables in the Cloudflare Pages dashboard under **Settings → Environment Variables**
4. Set `NEXT_PUBLIC_APP_URL` to your production domain

---

## Version History

| Version | Date | Notes |
|---|---|---|
| 0.1.0 | Mar 2026 | Initial scaffold from Create Next App |
| 0.2.0 | Mar 2026 | Full platform: auth, booking, galleries, admin, client portal |
| 0.3.0 | Mar 2026 | Role-based auth (Airtable roles, no ADMIN_FIREBASE_UID), invite system, staff page |
| 0.4.0 | Mar 2026 | Fix admin redirect (stale __role cookie), sessionVerified guard, auth log removal |
| 0.5.0 | Mar 2026 | Content CRUD in-app (packages, testimonials, availability), inquiry reply, gallery filters, settings tabs, clickable booking rows |
