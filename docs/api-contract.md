# PulseSocial — Backend API Contract & Specification

## 1. Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-10-10T06:30:00.000Z"
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": "Human-readable description of error",
  "code": "ERROR_CODE_ENUM",
  "details": {},
  "requestId": "req_abc123"
}
```

## 2. Standard Error Codes
- `AUTH_INVALID_CREDENTIALS`: Email or password incorrect.
- `EMAIL_NOT_VERIFIED`: Action requires verified email address.
- `OTP_INVALID`: OTP hash does not match.
- `OTP_EXPIRED`: OTP has expired (> 5 minutes).
- `OTP_RATE_LIMITED`: Too many invalid attempts or resend requested before cooldown.
- `OAUTH_STATE_INVALID`: State mismatch or expired.
- `OAUTH_CONFIG_MISSING`: Client credentials missing from server environment.
- `FORBIDDEN`: User lacks role permissions in the target organization.
- `RESOURCE_NOT_FOUND`: Target entity not found in active organization.
- `VALIDATION_ERROR`: Zod payload validation failed.
- `PROVIDER_NOT_CONNECTED`: No active account for this provider.
- `PROVIDER_TOKEN_EXPIRED`: OAuth token expired, reconnect required.
- `PROVIDER_PERMISSION_MISSING`: Missing platform OAuth scope.
- `PROVIDER_APPROVAL_REQUIRED`: Platform requires official developer app review or partner approval.
- `PROVIDER_UNSUPPORTED_CAPABILITY`: Operation not exposed by official platform API.
- `MEDIA_VALIDATION_FAILED`: Media size, duration, or format violates platform limits.
- `SCHEDULE_CONFLICT`: Invalid schedule timestamp (must be in future).
- `IDEMPOTENCY_CONFLICT`: Concurrent or duplicate request detected.
- `INTEGRATION_NOT_CONFIGURED`: Missing third-party service API key.
- `INTERNAL_ERROR`: Unhandled server-side error (stack trace redacted).

## 3. Route Endpoints Catalog

### Authentication
- `POST /api/auth/register` (alias `/api/auth/signup`): Create unverified user, issue 6-digit OTP.
- `POST /api/auth/login`: Authenticate email/password. Triggers OTP challenge if mandatory or returns session.
- `POST /api/auth/logout`: Invalidate HttpOnly session cookie.
- `GET /api/auth/me`: Retrieve active user profile and active workspace membership.
- `POST /api/auth/verify-email/request` (alias `/api/auth/resend-otp`): Resend OTP with 60s cooldown.
- `POST /api/auth/verify-email/confirm` (alias `/api/auth/verify-otp`): Validate 6-digit OTP and activate user.
- `POST /api/auth/password-reset/request` (alias `/api/auth/forgot-password`): Request 6-digit reset OTP.
- `POST /api/auth/password-reset/complete` (alias `/api/auth/reset-password`): Complete reset with valid OTP and new password.
- `GET /api/auth/google`: Initiate Google OAuth 2.0 PKCE challenge.
- `GET /api/auth/google/callback`: Handle Google OAuth callback and link/create user.

### Workspaces & Organizations
- `GET /api/organizations`: List organizations the user belongs to.
- `POST /api/organizations`: Create new workspace organization.
- `GET /api/organizations/:id`: Retrieve workspace details.
- `GET /api/organizations/:id/members`: List members and assigned roles.

### Social Accounts
- `GET /api/social/accounts`: List connected social accounts in the active workspace.
- `GET /api/social/providers`: List supported platforms and connection statuses.
- `GET /api/social/:provider/connect`: Initiate provider OAuth authorization flow.
- `GET /api/social/:provider/callback`: Handle provider OAuth token exchange and account registration.
- `POST /api/social/accounts/:id/disconnect`: Revoke provider token, clear credentials, mark disconnected.
- `POST /api/social/accounts/:id/sync`: Sync latest public profile and follower counts.
- `GET /api/social/accounts/:id/capabilities`: Return live platform capability matrix for this account.

### Publishing & Posts
- `GET /api/posts`: List posts with status, filters, and target outcomes.
- `POST /api/posts`: Create draft or scheduled post with per-platform target validation.
- `GET /api/posts/:id`: Get detailed post info, media assets, and per-target publishing attempts.
- `PATCH /api/posts/:id`: Edit draft or update scheduled time.
- `DELETE /api/posts/:id`: Delete post and associated targets.
- `POST /api/posts/:id/publish`: Publish immediately to connected target accounts.
- `POST /api/posts/:id/schedule`: Schedule post for specified UTC timestamp.
- `POST /api/posts/:id/retry`: Retry failed targets for a post.

### Engagement & Inbox
- `GET /api/comments`: Fetch authentic synchronized comments for published posts.
- `POST /api/comments`: Post real comment or reply via official provider API.
- `GET /api/inbox/conversations`: Fetch real inbound messages and comments.
- `POST /api/inbox/conversations/:id/reply`: Post authentic reply to a conversation.

### Analytics
- `GET /api/analytics`: Overview metrics (impressions, reach, engagement, followers) strictly from real data.
- `GET /api/analytics/channels`: Per-network audience and activity breakdown.

### AI & Integrations
- `POST /api/ai/generate`: Generate social copy using Google Gemini API.
- `POST /api/ai/hashtags`: Generate contextual hashtags.
- `GET /api/integrations/canva/status`: Check Canva Connect integration status.

### Operations & Health
- `GET /api/health/live`: Unauthenticated liveness probe.
- `GET /api/health/ready`: Readiness probe verifying database connectivity and essential config.
- `GET /api/social/health`: Health status of social network integrations.
- `POST /api/cron/publisher`: Worker executing due scheduled posts, secured via `CRON_SECRET`.
