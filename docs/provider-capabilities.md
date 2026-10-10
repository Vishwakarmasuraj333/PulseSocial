# PulseSocial — Social Media Provider Capabilities Matrix

This document defines the real-world capabilities, official API endpoints, granted scope requirements, and approval requirements for each social network.

| Provider | Official API Version | Publishing Support | Video Support | Comment / Reply | Likes / Reactions | Direct Messages | App Review / Approval Required | Notes / Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Instagram** | Meta Graph API v22.0 | Yes (Pro/Creator) | Yes (Reels/Feed) | Yes | No (Policy restricted) | Yes (Messenger API) | **Yes** (`instagram_content_publish`) | Requires Professional account linked to Facebook Page. |
| **Facebook** | Meta Graph API v22.0 | Yes (Pages) | Yes | Yes | Yes (Page context) | Yes (Page inbox) | **Yes** (`pages_manage_posts`) | Page management permissions required. Personal profiles unsupported for publishing by Meta policy. |
| **LinkedIn** | REST Posts API (202401) | Yes (Member & Org) | Yes | Yes | Yes | No | **No** for Member (`w_member_social`), **Yes** for Organization | Post character limit 3,000. Uses modern UGC/Posts endpoint. |
| **X (Twitter)** | Twitter API v2 | Yes | Yes | Yes | Yes | Yes (v2 DM endpoint) | **No** (Standard / Basic Plan) | Strict 280 character limit for non-premium accounts. OAuth 2.0 PKCE. |
| **TikTok** | Content Posting API v2 | Approval Required | Yes (Video only) | Yes (Webhooks) | No | No | **Yes** (Direct Post Audit) | Direct posting requires developer application audit approval from TikTok. |
| **YouTube** | YouTube Data API v3 | Yes (Private by default) | Yes (Video only) | Yes | Yes | No | **Yes** for Public videos (Google Cloud Audit) | Direct video upload supported; uploads default to Private until Google OAuth app verification audit is completed. |
| **Pinterest** | Pinterest API v5 | Yes | Yes | No | No | No | **Yes** (Standard Access Review) | Requires Board selection and Board ID. |
| **Threads** | Threads API v1.0 | Yes | Yes | Yes | No | No | **Yes** (Meta App Review) | 500-character limit. Two-step media container publish flow. |
| **Google Business**| Business Profile API v1| Yes | No (Images only) | Yes (Reviews) | No | No | **Yes** (GMB API Access Approval) | Local updates and photos for verified physical locations. |
| **Mastodon** | Mastodon REST API v1 | Yes | Yes | Yes | Yes (Favoriting) | Yes (Direct statuses) | **No** (Decentralized OAuth) | 500-character limit. No centralized app review gate. |
| **Bluesky** | AT Protocol XRPC | Yes | No (Images only) | Yes | Yes | No | **No** (App Passwords / OAuth) | 300-grapheme character limit. |
| **Telegram** | Telegram Bot API | Yes (Channels/Groups) | Yes | No (Bot context) | No | Yes | **No** (Bot token) | Requires bot added as Administrator in target channel. |
| **Reddit** | Reddit OAuth API | Yes (Subreddits) | No (Images/Links) | Yes | Yes (Upvote/Downvote)| No | **No** (Standard OAuth Script) | Subreddit posting rules and flair constraints apply. |
| **Snapchat** | Snap Marketing Kit | Blocked | No | No | No | No | **Yes** (Snap Partner Approval) | Direct story publishing restricted to approved Snap partners. |

## Truthful Integration Policy
1. When credentials are not configured in `.env`, the provider reports `status: "CONFIGURATION_REQUIRED"`.
2. When developer app review is pending, the provider reports `status: "APPROVAL_REQUIRED"` and explicitly surfaces the blocking requirement without faking success.
3. Operations unsupported by the official platform API (e.g. liking on Instagram) return `PROVIDER_UNSUPPORTED_CAPABILITY` and provide a link to native action where appropriate.
