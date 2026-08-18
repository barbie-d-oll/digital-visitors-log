# 🚪 Digital Visitors Log

A modern, secure, multi-tenant visitor management SaaS built with **Next.js**, **MongoDB**, and **TypeScript**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌐 Live Demo

**Application:** https://digital-visitors-log.vercel.app/

---

## 📌 Overview

Digital Visitors Log is a cloud-based multi-tenant visitor management platform designed to replace traditional paper visitor books. Organizations sign up, configure their workspace, and manage visitors through a professional dashboard.

**Ideal for:** Corporate offices, schools, hospitals, government institutions, NGOs, co-working spaces.

---

## ✨ Features

### Visitor Management
- QR code check-in (org-specific kiosk page)
- Pre-registration / appointments with codes
- Returning visitor detection (auto-fills form)
- Visitor sign-out with unique code
- NDA / document signing during check-in
- Visitor badge data generation
- Emergency evacuation list (who's on-premises now)

### Notifications
- Email notifications via Nodemailer (SMTP)
- SMS notifications via SMS Online GH
- Slack and Microsoft Teams webhooks
- Department head notifications
- Configurable per-organization

### Security & Compliance
- JWT + bcryptjs authentication
- Google OAuth login
- Blocklist / watchlist with auto-deny
- Audit logging (all actions tracked)
- Role-based access control (owner, admin, staff)
- NDA signature storage

### Multi-tenant SaaS
- Organization isolation (all data scoped by org ID)
- Multi-org membership (users can belong to multiple orgs)
- Per-org SMS API keys and settings
- Custom branding (logo, colors)
- Multi-location support

### Dashboard
- Analytics (peak hours, busiest days, purpose breakdown)
- Reports with CSV/JSON export
- Staff & department management
- Appointment scheduling
- Settings (notifications, integrations, NDA, branding)
- Kiosk & QR code management

---

## 🛠 Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Full-stack framework |
| React 19 | UI layer |
| TypeScript 5 | Type safety |
| MongoDB + Mongoose | Database |
| bcryptjs + JWT | Authentication |
| Google OAuth 2.0 | Social login |
| Nodemailer | Email delivery |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Recharts | Charts |
| Vercel | Deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- SMTP email account (Gmail app password works)

### Install

```bash
git clone https://github.com/yourusername/digital-visitors-log.git
cd digital-visitors-log
npm install
```

### Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digital-visitors-log

# JWT
JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Visitor Log <your-email@gmail.com>

# SMS
SMS_TOKEN=your_sms_api_key
SMS_SENDER=HWSTECH

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Open http://localhost:3000, then go to `/auth/register` to create your first organization.

---

## 📂 Project Structure

```
app/
├── api/              # All API routes (auth, visitors, staff, etc.)
├── auth/             # Login, register, forgot/reset password
├── dashboard/        # 17 dashboard pages
├── kiosk/[slug]/     # Org-specific reception kiosk
├── register/         # Public visitor check-in
├── logout/           # Public visitor sign-out
└── onboarding/       # New org setup wizard

lib/
├── auth/             # JWT, password, Google OAuth helpers
├── db/               # Mongoose connection
├── models/           # All Mongoose schemas
├── notifications/    # Email, Slack/Teams, host notification
├── sms/              # SMS Online GH integration
└── audit.ts          # Audit logging helper

context/              # AuthContext (React Context + JWT)
components/           # Shared UI components
```

---

## 📄 License

MIT License.
