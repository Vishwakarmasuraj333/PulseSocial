# PulseSocial — Enterprise Social Media Management SaaS Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-green)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

PulseSocial is a brand-new standalone full-stack social media management SaaS platform built with the Next.js App Router, Prisma ORM, and comprehensive OAuth integrations. Inspired by enterprise UX patterns (such as Zoho Social), it delivers high visual polish, zero promotional spam, real OAuth state + PKCE protection, and hardware-grade AES-256-GCM token encryption.

---

## Key Features

1. **Authentication & Email OTP Flow**:
   - Secure signup, login, password recovery, and email verification via 6-digit hashed OTPs.
   - Configurable SMTP delivery with rate-limiting, resend cooldowns, and brute-force protection.
2. **Dedicated Post-Login First Experience (`/onboarding/socials`)**:
   - Clean, ad-free "Get started by setting up a Brand" interface.
   - 13 social platform selector icons bar (Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Threads, Telegram, WhatsApp, Snapchat).
   - Dedicated Instagram selection modal: "Connect via Instagram [NEW]" vs "Connect via Facebook".
   - Celebratory Brand Connection screen with large avatar, verified checkmark badge, and handle.
   - Team Invitation modal with role assignment, channel access limits, and approver privileges.
3. **Studio Post Composer (`/posts/new`)**:
   - Multi-channel simultaneous authoring with per-platform character limits.
   - Real-time native live preview simulators for Instagram, X (Twitter), LinkedIn, and Facebook.
   - Media attachments and AI copilot integration.
   - Publishing lifecycle: Draft, Queue, Scheduled, Publishing, Published, Failed with retry tracking.
4. **Content Calendar (`/calendar`)**:
   - Month & Week views with color-coded status badges and detailed inspection drawers.
5. **Unified Social Inbox (`/inbox`)**:
   - Two-pane thread view for comments, direct messages, and brand mentions with instant reply capabilities.
6. **Cross-Network Analytics & Reports (`/analytics`, `/reports`)**:
   - Live telemetry, reach and impression curves, CSV export, and executive summaries.
7. **Security & Governance**:
   - AES-256-GCM token vault.
   - Never collects or stores third-party passwords.
   - Structured audit logging and inbound webhook signature validation.

---

## Quick Start & Installation

### 1. Install Dependencies
```bash
cd pulsesocial
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `ENCRYPTION_KEY` is a 32-byte hex string (64 characters) or secure phrase.

### 3. Initialize Database & Seed
For instant local testing, PulseSocial is pre-configured with SQLite (`file:./dev.db`).
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

Demo Admin credentials created by the seed:
- **Email**: `admin@pulsesocial.io`
- **Password**: `Password123!`

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## PostgreSQL & Redis Setup (Production & Docker)

To run with PostgreSQL and Redis, spin up the included `docker-compose.yml`:
```bash
docker compose up -d
```
Then update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://pulsesocial:pulsesocial_password@localhost:5432/pulsesocial_db?schema=public"
```
Switch `provider = "postgresql"` in `prisma/schema.prisma` (or copy from `prisma/schema.postgresql.prisma`), then run:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Social Provider Developer Setup & Redirect URLs

All OAuth redirects use the base URL: `http://localhost:3000` (or your production domain).

### 1. Meta (Facebook Pages & Instagram Professional)
- Portal: [Meta for Developers](https://developers.facebook.com/)
- App Type: **Business**
- Products: **Facebook Login for Business**, **Instagram Graph API**
- Valid OAuth Redirect URIs:
  - `http://localhost:3000/api/social/facebook/callback`
  - `http://localhost:3000/api/social/instagram/callback`
- Webhook Callback URL:
  - `http://localhost:3000/api/webhooks/facebook`
  - Verify Token: configured in `META_WEBHOOK_VERIFY_TOKEN`

### 2. LinkedIn (v2 API & Community Management)
- Portal: [LinkedIn Developers](https://www.linkedin.com/developers/)
- Products: **Share on LinkedIn**, **Sign In with LinkedIn using OpenID Connect**
- Authorized Redirect URLs:
  - `http://localhost:3000/api/social/linkedin/callback`

### 3. TikTok (Login Kit & Content Posting)
- Portal: [TikTok for Developers](https://developers.tiktok.com/)
- Products: **Login Kit**, **Content Posting API**
- Redirect Domain: `localhost:3000`
- Redirect URI: `http://localhost:3000/api/social/tiktok/callback`

### 4. X / Twitter (OAuth 2.0 PKCE)
- Portal: [X Developer Portal](https://developer.x.com/)
- App Settings: **User authentication settings** -> OAuth 2.0 (Confidential Client / Web App)
- Callback URL: `http://localhost:3000/api/social/x/callback`

### 5. Google / YouTube Data API v3 & Google Business Profile
- Portal: [Google Cloud Console](https://console.cloud.google.com/)
- APIs Enabled: **YouTube Data API v3**, **My Business Account Management API**
- Authorized Redirect URIs:
  - `http://localhost:3000/api/social/youtube/callback`
  - `http://localhost:3000/api/social/google-business/callback`

### 6. Pinterest
- Portal: [Pinterest Developers](https://developers.pinterest.com/)
- Redirect URI: `http://localhost:3000/api/social/pinterest/callback`

---

## Production Build & Deployment

```bash
npm run build
npm run start
```
