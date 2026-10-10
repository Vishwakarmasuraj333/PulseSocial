# PulseSocial — Cookies, Sessions & Consent Specification

## 1. Cookie Inventory

| Cookie Name | Category | Purpose | Flags / Lifespan |
| :--- | :--- | :--- | :--- |
| `pulsesocial_auth_session` | Strictly Necessary | Authenticated session token (JWT with subject and workspace) | `HttpOnly; Secure; SameSite=Lax; Path=/; 30d (or 24h)` |
| `pulsesocial_consent` | Strictly Necessary | Records user cookie consent decision, category selections & policy version | `Secure; SameSite=Lax; Path=/; 365d` |
| `google_oauth_state` | Strictly Necessary | OAuth 2.0 PKCE flow integrity state | `HttpOnly; Secure; SameSite=Lax; 15m; deleted on callback` |
| `google_oauth_code_verifier`| Strictly Necessary | PKCE SHA-256 verifier challenge | `HttpOnly; Secure; SameSite=Lax; 10m; deleted on callback` |
| `_ga`, `_gid` | Analytics | Optional usage measurement (Google Analytics) | Set **ONLY** after explicit user opt-in (`analytics: true`) |
| `_fbp` | Marketing | Optional marketing attribution | Set **ONLY** after explicit user opt-in (`marketing: true`) |

## 2. Consent Policy & Rules
1. **Default State**:
   - Strictly necessary cookies do not require prior consent.
   - All optional categories (`preferences`, `analytics`, `marketing`) default to **OFF (`false`)** until the user explicitly accepts.
2. **Persistence**:
   - Every consent decision (`ACCEPT_ALL`, `REJECT_ALL`, `CUSTOM`, `WITHDRAWN`) creates a permanent audit record in the `ConsentRecord` table.
   - Privacy-preserving: Raw IP addresses are **never** stored. Anonymous visitor IDs are cryptographically hashed.
3. **Withdrawal**:
   - Calling `DELETE /api/consent` immediately withdraws consent, marks the decision `WITHDRAWN`, and purges all non-essential cookies.
4. **Policy Versioning**:
   - Current policy version: `2026-10`.
   - When `CURRENT_POLICY_VERSION` is incremented, outdated consent cookies are invalidated and the banner prompts the user again.

## 3. Consent API Contract
- `GET /api/consent`: Retrieve current consent status.
- `POST /api/consent`: Record consent choice (`ACCEPT_ALL`, `REJECT_ALL`, `CUSTOM`).
- `DELETE /api/consent`: Withdraw consent and clean non-essential cookies.
