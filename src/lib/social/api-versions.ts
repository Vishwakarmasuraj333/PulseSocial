/**
 * Centralized Social Media API Versions Configuration
 * Ensures that all platform adapters declare and use the exact, active API versions
 * mandated by each official developer platform.
 */

export const SOCIAL_API_VERSIONS = {
  META_GRAPH: "v20.0",
  LINKEDIN_REST: "202401",
  LINKEDIN_RESTLI_PROTOCOL: "2.0.0",
  X_API: "2",
  YOUTUBE_API: "v3",
  TIKTOK_API: "v2",
  PINTEREST_API: "v5",
  THREADS_API: "v1.0",
  GOOGLE_BUSINESS_API: "v4",
  MASTODON_API: "v1",
  REDDIT_API: "v1",
  BLUESKY_XRPC: "com.atproto",
  TELEGRAM_BOT_API: "bot",
  SNAPCHAT_KIT_API: "v1",
} as const;
