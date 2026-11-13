# PulseSocial — Production & Development Environment Variable Reference

> **Project**: PulseSocial ([https://pulsesocial1.vercel.app/](https://pulsesocial1.vercel.app/))  
> **Security Tier**: Enterprise Confidential  
> **Target Environments**: Local (`.env.local`), Vercel Production (`Vercel Project Settings`)  

---

## 1. Environment Variable Catalog

| Variable Name | Required | Tier | Description & Expected Format | Security Note |
|:---|:---:|:---:|:---|:---|
| `DATABASE_URL` | **YES** | Database | Pooled PostgreSQL connection string (`postgresql://...`) | Private. Never expose client-side. |
| `DIRECT_URL` | **YES** | Database | Direct (unpooled) PostgreSQL connection string for Prisma migrations | Private. |
| `JWT_SECRET` | **YES** | Security | 64-character hex string for HMAC-SHA256 session token signing | Generate via `openssl rand -hex 32` |
| `TOKEN_ENCRYPTION_KEY` | **YES** | Security | 32-byte hex string (64 characters) for AES-256-GCM OAuth token encryption | Master key for token vault. Must never be lost or rotated without data migration. |
| `NEXT_PUBLIC_APP_URL` | **YES** | App | Fully qualified origin (`https://pulsesocial1.vercel.app` or `http://localhost:3000`) | Public. Used for OAuth redirect URI construction. |
| `GEMINI_API_KEY` | **YES** | AI | Google AI Studio Gemini API Key (`AIzaSy...`) | Private. Powers Gemini 2.5 generative features. |
| `GOOGLE_CLIENT_ID` | Optional | OAuth | Google Cloud OAuth 2.0 Web Client ID | Publicly recognizable client identifier. |
| `GOOGLE_CLIENT_SECRET` | Optional | OAuth | Google Cloud OAuth 2.0 Client Secret | Private. |
| `META_APP_ID` | Optional | OAuth | Meta for Developers Facebook App ID | Publicly recognizable app identifier. |
| `META_APP_SECRET` | Optional | OAuth | Meta for Developers Facebook App Secret | Private. Used in server-side OAuth token exchange. |
| `LINKEDIN_CLIENT_ID` | Optional | OAuth | LinkedIn Developer Application Client ID | Public. |
| `LINKEDIN_CLIENT_SECRET`| Optional | OAuth | LinkedIn Developer Application Client Secret | Private. |
| `TWITTER_CLIENT_ID` | Optional | OAuth | X (Twitter) Developer App Client ID | Public. |
| `TWITTER_CLIENT_SECRET`| Optional | OAuth | X (Twitter) Developer App Client Secret | Private. |
| `CLOUDINARY_CLOUD_NAME`| Optional | Media | Cloudinary Cloud Name for media asset storage | Public. |
| `CLOUDINARY_API_KEY` | Optional | Media | Cloudinary API Key | Private. |
| `CLOUDINARY_API_SECRET`| Optional | Media | Cloudinary API Secret | Private. |
| `SMTP_HOST` | Optional | Mail | SMTP Server Host (e.g. `smtp.resend.com` or `smtp.sendgrid.net`) | Private. |
| `SMTP_PORT` | Optional | Mail | SMTP Port (`587` for TLS, `465` for SSL) | Private. |
| `SMTP_USER` | Optional | Mail | SMTP Username | Private. |
| `SMTP_PASS` | Optional | Mail | SMTP Password / API Token | Private. |
| `SMTP_FROM` | Optional | Mail | Default outgoing sender (`support@pulsesocial.com`) | Public. |

---

## 2. Local Development Template (`.env.example`)

```bash
# ==============================================================================
# PULSESOCIAL ENTERPRISE SAAS CONFIGURATION TEMPLATE
# ==============================================================================

# Core Application Origin
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# PostgreSQL Database (Supabase / Neon / Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulsesocial?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/pulsesocial?schema=public"

# Cryptographic Keys (Do not use these sample values in production)
JWT_SECRET="e9b98f24a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5"
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Google Gemini AI Integration
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Meta (Facebook / Instagram) Credentials
META_APP_ID=""
META_APP_SECRET=""

# LinkedIn Community Management Credentials
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# X (Twitter) API v2 Credentials
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

# Cloudinary Media Asset Pipeline
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Transactional Email (Nodemailer SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="PulseSocial Team <notifications@pulsesocial.com>"
```

---

## 3. Production Verification Checklist

1. **Secret Generation**: Never reuse development secrets in production. Generate fresh 256-bit keys using `openssl rand -hex 32`.
2. **Vercel Deployment**: Ensure all environment variables are added under `Vercel Dashboard > Project > Settings > Environment Variables` for both `Production` and `Preview` environments.
3. **Database Migration**: Ensure `npx prisma db push` or `npx prisma migrate deploy` has executed successfully on the production database.
