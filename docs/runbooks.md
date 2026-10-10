# PulseSocial — Operational Runbooks & Provider Setup Guide

## 1. Cron & Scheduled Publishing Runbook

### Worker Invocations
- **Publishing Worker**:
  ```bash
  curl -X POST https://your-domain.com/api/cron/publisher \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
  - **Frequency**: Every 1 minute via GitHub Actions, Vercel Cron, or server crontab.
  - **Security**: The request header is compared using constant-time `crypto.timingSafeEqual`.
  - **Locking & Missed Jobs**: Targets are claimed atomically using `isLocked: true`. Any post with `runAt <= now` whose status is `SCHEDULED` will be processed. Expired locks (> 10 minutes) are automatically recovered.

- **Engagement & Webhook Sync Worker**:
  ```bash
  curl -X POST https://your-domain.com/api/cron/social-engagement \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
  - **Frequency**: Every 5-15 minutes to refresh metrics and sync comments.

## 2. Token Vault & Key Rotation Runbook
1. Current key version is `v1`, configured via `TOKEN_ENCRYPTION_KEY`.
2. When rotating encryption keys:
   - Generate a new 32-byte hex secret for `v2`.
   - Update `CURRENT_KEY_VERSION` to `v2`.
   - Existing tokens decrypted with `v1` key are re-encrypted with `v2` during scheduled token refreshes.

## 3. Social Provider Developer App Setup Matrix

| Provider | What to Create | Required Scopes | Approval Required |
| :--- | :--- | :--- | :--- |
| **Meta (Instagram & Facebook)** | Meta App (Business type) in Meta for Developers | `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish` | **Yes** (App Review + Business Verification) |
| **LinkedIn** | LinkedIn Developer App | `w_member_social`, `openid`, `profile`, `email` | **No** for Member; **Yes** for Organization posting |
| **X (Twitter)** | Project & App in X Developer Portal | `tweet.read`, `tweet.write`, `users.read`, `offline.access` | **No** (Standard OAuth 2.0 PKCE) |
| **YouTube** | Google Cloud Console Project | `https://www.googleapis.com/auth/youtube.upload` | **Yes** for Public videos; uploads default to Private |
| **TikTok** | TikTok for Developers App | `user.info.basic`, `video.upload` | **Yes** (Content Posting API Audit) |
| **Pinterest** | Pinterest Developer Portal App | `boards:read`, `pins:read`, `pins:write` | **Yes** (Standard Access Review) |

## 4. Go-Live Checklist
- [ ] Production PostgreSQL connection string verified.
- [ ] SMTP transporter verified (Gmail App Password or SendGrid/Postmark).
- [ ] `TOKEN_ENCRYPTION_KEY` generated as 64-character hex string.
- [ ] `CRON_SECRET` configured in deployment secret manager.
- [ ] Cookie consent banner active with `pulsesocial_consent` cookie.
- [ ] Health endpoints `/api/health/live` and `/api/health/ready` responding HTTP 200.
