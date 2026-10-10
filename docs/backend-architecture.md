# PulseSocial — Production Backend Architecture Specification

## 1. Overview
PulseSocial is an enterprise-grade multi-tenant social media management platform built on Next.js 15 (App Router), Prisma ORM, PostgreSQL, and TypeScript.
This document defines the backend system architecture, security policies, multi-workspace isolation model, and data flow.

## 2. Core Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Request                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. API & Controller Layer (src/app/api/*)                   │
│    - JSON Envelopes & HTTP Status Codes                     │
│    - Zod Input Validation & Sanitization                    │
│    - Request ID Tracing                                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Security & Tenant Layer (src/lib/auth/*, middleware)     │
│    - HttpOnly JWT Session Validation                        │
│    - Mandatory Workspace (Organization) Membership Guard    │
│    - RBAC (OWNER, ADMIN, MANAGER, EDITOR, ANALYST, VIEWER)  │
│    - Sensitive Secret Redaction & Constant-Time Auth        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Domain Services Layer (src/lib/services/*, social/*)     │
│    - Business Rules & Transaction Boundaries                │
│    - Idempotency & Concurrency Locks                        │
│    - Email OTP Dispatch & Verification Engine               │
│    - Publishing & Queue Orchestration                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│ 4. Provider Adapter Registry │ │ 5. Data Layer (Prisma ORM)  │
│    (src/lib/social/*)        │ │    - Tenant-Scoped Queries  │
│    - Official OAuth 2.0 PKCE │ │    - AES-256-GCM Vault      │
│    - Capability Matrix       │ │    - Safe UTC Timestamps    │
│    - Rate Limits & Retries   │ │    - Audit Event Trails     │
└──────────────────────────────┘ └─────────────────────────────┘
```

## 3. Multi-Tenant Organization Isolation
1. **Tenant Boundary**: Every business entity (posts, media, comments, accounts, audit logs, analytics) belongs to an `Organization`.
2. **Strict Scoping**: Every database read and mutation MUST include `where: { organizationId: session.activeOrgId }` or link through a verified membership.
3. **No IDOR**: Query parameters supplying foreign entity IDs are strictly matched against the tenant organization. If an entity exists but belongs to another workspace, the backend returns HTTP 404 (or 403) without leaking existence.
4. **Member Role Hierarchy**:
   - `OWNER`: Full administrative access, billing, workspace deletion, member management.
   - `ADMIN`: Manage social accounts, invite members, publish content.
   - `EDITOR`: Create, edit, schedule, and publish posts; reply to comments.
   - `ANALYST`: View analytics, post reports, and comments; read-only operations.
   - `VIEWER`: Read-only access to calendar and published posts.

## 4. Authentication & Verification
- **Sign-Up Flow**: User submits name, email, password. A User record is created with `emailVerified: false`. A cryptographically secure 6-digit OTP is generated using `crypto.randomInt(100000, 1000000)`, hashed with SHA-256, and stored in `EmailVerificationOTP` with a 5-minute expiry.
- **Delivery**: Dispatched via configured SMTP transporter (e.g. Gmail App Password).
- **Verification Flow**: User submits the 6-digit OTP. The backend validates expiry, rate limits attempts (max 5), compares the SHA-256 hash, marks the user verified, and consumes the OTP (single-use). A secure HttpOnly session cookie is established.
- **Unverified Blockade**: Middleware and protected API endpoints reject unverified users from accessing workspace dashboards or operations.
- **Password Reset**: Single-use 6-digit recovery OTP, 5-minute expiry, rate-limited, revokes existing active sessions upon successful reset.
- **Google OAuth 2.0**: PKCE code challenge and cryptographically signed state token with nonce. Verifies Google OpenID Connect ID token and links or creates accounts transactionally.

## 5. Social Credential Vault & Encryption
- Tokens are encrypted at rest using **AES-256-GCM** with a 256-bit key (`TOKEN_ENCRYPTION_KEY` or `ENCRYPTION_KEY`), 16-byte random initialization vector (IV), and 16-byte authentication tag.
- Raw access and refresh tokens are NEVER logged, returned in API payloads, or persisted in plain text.
- Key versioning (`v1`) allows future zero-downtime key rotation.

## 6. Durable Publishing Engine
- Posts have one or more `PostTarget` records representing individual networks.
- Independent statuses per target (`PENDING`, `PUBLISHED`, `FAILED`) guarantee partial-success visibility (e.g. Facebook succeeds while Instagram fails).
- Background scheduler `/api/cron/publisher` validates `CRON_SECRET` using constant-time comparison (`crypto.timingSafeEqual`).
- Atomic locking via `isLocked` flag and timestamps prevents race conditions across worker invocations.
- Idempotency records prevent double-publishing retried operations.

## 7. Real Analytics & Engagement
- Metric records store only genuine platform-returned data (`likes`, `impressions`, `reach`, `shares`).
- Missing or unsupported metrics remain `null` rather than falsified to `0`.
- Empty workspaces display authentic zero counts and empty state indicators.
- Webhooks verify cryptographic signatures (Meta HMAC-SHA256, Twitter CRC) and deduplicate via `WebhookEvent.eventId`.
