# PulseSocial — Production Integration Limitations & Vendor Boundaries

> **Platform**: PulseSocial Enterprise SaaS ([https://pulsesocial1.vercel.app/](https://pulsesocial1.vercel.app/))  
> **Author & Lead Architect**: Suraj Vishwakarma  
> **Document Purpose**: Truthful, transparent disclosure of third-party API capabilities, vendor developer review stages, and rate limit boundaries.  

---

## 1. Third-Party Vendor API Limitations & Developer Review States

PulseSocial strictly implements official vendor APIs and OAuth 2.0 protocols without brittle scrapers or undocumented private endpoints. When running in a standard developer or preview environment without enterprise partner approval, the following third-party platform limitations apply:

### 1.1 Meta for Developers (Facebook Pages & Instagram Professional)
- **App Review Requirement**: In development mode, only registered App Administrators, Developers, and Testers can authenticate via OAuth and publish content.
- **Production Verification**: To enable public user authentication and direct Instagram publishing (`instagram_content_publish`), Meta requires **Business Verification** and successful completion of **App Review** for advanced permissions.
- **Account Requirement**: Instagram publishing is strictly restricted by Meta to **Instagram Business / Creator Accounts** linked to a published Facebook Page. Personal Instagram profiles cannot be automated via the official Graph API.
- **Current Status**: All code, token exchange handlers, AES-256 vaulting, and publishing endpoints are 100% production-ready. Live public testing requires linking a Meta Verified Business App ID.

### 1.2 X (Twitter) API v2
- **Tier Constraints**: The X Developer Free Tier allows only 1,500 Tweet creations per month and enforces write-only access (profile lookup and analytics ingestion are disabled on the Free tier).
- **Media Upload Limitations**: Multi-image attachments require the legacy v1.1 `upload.twitter.com` endpoint, which is throttled under standard free tiers.
- **Current Status**: Full OAuth 2.0 PKCE and Tweet dispatch handlers are implemented. Production analytics ingestion requires an upgraded X Developer Basic ($100/mo) or Pro subscription.

### 1.3 LinkedIn Community Management API
- **Partner Access**: Authoring posts on behalf of LinkedIn Company Pages requires approved access to the LinkedIn Community Management API program. Personal profile publishing (`w_member_social`) is supported under standard consumer permissions.
- **Current Status**: All URN payload formatting, token exchange, and multi-image dispatch pipelines are implemented.

### 1.4 YouTube Data API v3
- **Daily Quota Ceiling**: Google Cloud assigns a default quota of **10,000 units per day**. A single video upload consumes 1,600 units (approximately 6 video uploads per day per developer project before quota exhaustion).
- **Current Status**: Resumable video upload protocol and automated metadata scheduling are fully implemented. Scaling to high enterprise volume requires submitting Google's Quota Extension Request.

### 1.5 Artificial Intelligence & Multi-Modal Generation
- **Google Gemini API**: Full integration via `@google/genai` targeting `gemini-2.5-flash` and `gemini-2.5-pro`.
- **Credential Requirement**: Generation requires a valid `GEMINI_API_KEY`. If unconfigured, the application gracefully renders an empty state badge explaining the missing key rather than fabricating mock outputs.

---

## 2. Architectural Integrity Statement

PulseSocial does **NOT** fabricate fake publishing confirmations, does **NOT** simulate fake follower numbers to populate charts, and does **NOT** generate mock data in production workflows. When a third-party service is unconfigured or a network request fails, the application truthfully displays informative empty states and error notices.
