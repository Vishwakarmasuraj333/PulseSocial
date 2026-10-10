/**
 * PulseSocial Platform Capabilities System
 * Declares strict real-world API capabilities, versioning, and compliance states
 * for each supported social network according to official developer platform policies.
 */

import { SOCIAL_API_VERSIONS } from "./api-versions";

export type PlatformIntegrationStatus =
  | "PRODUCTION READY"
  | "REAL API CONNECTED"
  | "APPROVAL REQUIRED"
  | "REAUTH REQUIRED"
  | "CONFIGURATION REQUIRED"
  | "UNSUPPORTED"
  | "BLOCKED"
  | "PREVIEW ONLY";

export interface PlatformCapability {
  platform: string;
  displayName: string;
  apiVersion: string;
  status: PlatformIntegrationStatus;

  // Real capability flags model (Section 2)
  CONNECTED: boolean;
  TOKEN_VALID: boolean;
  ACCOUNT_SYNCED: boolean;
  PUBLISHING_SUPPORTED: boolean;
  APPROVAL_REQUIRED: boolean;
  PUBLISHING_APPROVED: boolean;
  PUBLIC_PUBLISHING_ALLOWED: boolean;
  MEDIA_UPLOAD_SUPPORTED: boolean;
  REAL_API_VERIFIED: boolean;
  LAST_API_CHECKED_AT?: string;

  // Interaction permissions
  canPublish: boolean;
  canLike: boolean;
  canComment: boolean;
  canShare: boolean;
  canSave: boolean;
  canSchedule: boolean;
  supportedMedia: ("IMAGE" | "VIDEO" | "CAROUSEL" | "DOCUMENT")[];
  maxCharacterLimit: number;
  unsupportedMessage?: string;
  notes?: string;
}

export const PLATFORM_CAPABILITIES: Record<string, PlatformCapability> = {
  instagram: {
    platform: "instagram",
    displayName: "Instagram",
    apiVersion: `Graph API ${SOCIAL_API_VERSIONS.META_GRAPH}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true, // Requires Meta App Review for instagram_content_publish
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: false, // Meta Graph API restricts programmatic likes
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "CAROUSEL"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "Publishing requires Meta App Review for instagram_content_publish. Programmatic likes are restricted by Meta Graph API policy.",
    notes: "Requires Instagram Professional/Creator account connected to a Facebook Page.",
  },
  facebook: {
    platform: "facebook",
    displayName: "Facebook",
    apiVersion: `Graph API ${SOCIAL_API_VERSIONS.META_GRAPH}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true, // Requires Meta App Review for pages_manage_posts
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "CAROUSEL"],
    maxCharacterLimit: 63206,
    unsupportedMessage: "Publishing requires Meta App Review for pages_manage_posts.",
    notes: "Requires Facebook Page management permissions.",
  },
  linkedin: {
    platform: "linkedin",
    displayName: "LinkedIn",
    apiVersion: `REST Posts API (${SOCIAL_API_VERSIONS.LINKEDIN_REST})`,
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false, // Member personal publishing with w_member_social does not require partner review
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "DOCUMENT"],
    maxCharacterLimit: 3000,
    notes: "Migrated to current REST /rest/posts API using LinkedIn-Version 202401.",
  },
  x: {
    platform: "x",
    displayName: "X (Twitter)",
    apiVersion: `Twitter API v${SOCIAL_API_VERSIONS.X_API}`,
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false,
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 280,
    notes: "Enforces 280-character limit and OAuth 2.0 PKCE authentication.",
  },
  tiktok: {
    platform: "tiktok",
    displayName: "TikTok",
    apiVersion: `Content Posting API ${SOCIAL_API_VERSIONS.TIKTOK_API}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true,
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: false,
    canPublish: false, // Blocked pending TikTok partner approval
    canLike: false,
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "Publishing requires TikTok Direct Post approval under your TikTok for Developers account.",
    notes: "Direct Video Posting requires developer application audit approval from TikTok.",
  },
  youtube: {
    platform: "youtube",
    displayName: "YouTube",
    apiVersion: `YouTube Data API ${SOCIAL_API_VERSIONS.YOUTUBE_API}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true,
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 5000,
    unsupportedMessage: "CONFIGURED — YOUTUBE API AUDIT REQUIRED FOR PUBLIC UPLOADS (Uploaded videos default to private).",
    notes: "Uploads succeed as private videos until Google Cloud Project completes the third-party verification audit.",
  },
  pinterest: {
    platform: "pinterest",
    displayName: "Pinterest",
    apiVersion: `Pinterest API ${SOCIAL_API_VERSIONS.PINTEREST_API}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true, // Pinterest standard access requires app review
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: true,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
    unsupportedMessage: "Requires approved Pinterest Standard Access and valid board selection.",
  },
  threads: {
    platform: "threads",
    displayName: "Threads",
    apiVersion: `Threads API ${SOCIAL_API_VERSIONS.THREADS_API}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true, // Meta App Review for Threads API
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: false,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
    unsupportedMessage: "Public posting requires Meta Threads API App Review.",
    notes: "Two-step media container and publishing via official Graph API.",
  },
  googlebusiness: {
    platform: "googlebusiness",
    displayName: "Google Business Profile",
    apiVersion: `Business Profile API ${SOCIAL_API_VERSIONS.GOOGLE_BUSINESS_API}`,
    status: "APPROVAL REQUIRED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: true, // Google My Business API access approval
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: false,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE"],
    maxCharacterLimit: 1500,
    unsupportedMessage: "Requires Google Business Profile API account approval.",
  },
  mastodon: {
    platform: "mastodon",
    displayName: "Mastodon",
    apiVersion: `Mastodon REST API ${SOCIAL_API_VERSIONS.MASTODON_API}`,
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false, // Decentralized: no corporate approval required
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: true,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
  },
  telegram: {
    platform: "telegram",
    displayName: "Telegram",
    apiVersion: "Telegram Bot API",
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false,
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 4096,
  },
  reddit: {
    platform: "reddit",
    displayName: "Reddit",
    apiVersion: "Reddit OAuth API",
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false,
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE"],
    maxCharacterLimit: 40000,
  },
  bluesky: {
    platform: "bluesky",
    displayName: "Bluesky",
    apiVersion: "AT Protocol XRPC",
    status: "REAL API CONNECTED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: true,
    APPROVAL_REQUIRED: false,
    PUBLISHING_APPROVED: true,
    PUBLIC_PUBLISHING_ALLOWED: true,
    MEDIA_UPLOAD_SUPPORTED: true,
    REAL_API_VERIFIED: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE"],
    maxCharacterLimit: 300,
  },
  snapchat: {
    platform: "snapchat",
    displayName: "Snapchat",
    apiVersion: "Snap Marketing Kit",
    status: "BLOCKED",
    CONNECTED: false,
    TOKEN_VALID: false,
    ACCOUNT_SYNCED: false,
    PUBLISHING_SUPPORTED: false,
    APPROVAL_REQUIRED: true,
    PUBLISHING_APPROVED: false,
    PUBLIC_PUBLISHING_ALLOWED: false,
    MEDIA_UPLOAD_SUPPORTED: false,
    REAL_API_VERIFIED: false,
    canPublish: false,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: false,
    canSchedule: false,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 250,
    unsupportedMessage: "BLOCKED — PARTNER APPROVAL REQUIRED. Story posting via standard API token is restricted by Snap Inc.",
    notes: "Requires official approved Snapchat Creative Kit and Business Ad Account integration.",
  },
};

export function getPlatformCapability(
  platform: string,
  account?: {
    status?: string;
    tokenExpiresAt?: Date | string | null;
    lastSyncedAt?: Date | string | null;
  } | null
): PlatformCapability {
  const norm = platform.toLowerCase().replace(/[^a-z]/g, "");
  let base: PlatformCapability | null = null;
  if (norm.includes("facebook")) base = { ...PLATFORM_CAPABILITIES.facebook };
  else if (norm.includes("instagram")) base = { ...PLATFORM_CAPABILITIES.instagram };
  else if (norm.includes("linkedin")) base = { ...PLATFORM_CAPABILITIES.linkedin };
  else if (norm.includes("x") || norm.includes("twitter")) base = { ...PLATFORM_CAPABILITIES.x };
  else if (norm.includes("tiktok")) base = { ...PLATFORM_CAPABILITIES.tiktok };
  else if (norm.includes("youtube")) base = { ...PLATFORM_CAPABILITIES.youtube };
  else if (norm.includes("pinterest")) base = { ...PLATFORM_CAPABILITIES.pinterest };
  else if (norm.includes("thread")) base = { ...PLATFORM_CAPABILITIES.threads };
  else if (norm.includes("google")) base = { ...PLATFORM_CAPABILITIES.googlebusiness };
  else if (norm.includes("mastodon")) base = { ...PLATFORM_CAPABILITIES.mastodon };
  else if (norm.includes("telegram")) base = { ...PLATFORM_CAPABILITIES.telegram };
  else if (norm.includes("reddit")) base = { ...PLATFORM_CAPABILITIES.reddit };
  else if (norm.includes("bluesky")) base = { ...PLATFORM_CAPABILITIES.bluesky };
  else if (norm.includes("snapchat")) base = { ...PLATFORM_CAPABILITIES.snapchat };
  else {
    base = {
      platform: norm,
      displayName: platform,
      apiVersion: "REST API",
      status: "CONFIGURATION REQUIRED",
      CONNECTED: false,
      TOKEN_VALID: false,
      ACCOUNT_SYNCED: false,
      PUBLISHING_SUPPORTED: false,
      APPROVAL_REQUIRED: false,
      PUBLISHING_APPROVED: false,
      PUBLIC_PUBLISHING_ALLOWED: false,
      MEDIA_UPLOAD_SUPPORTED: false,
      REAL_API_VERIFIED: false,
      canPublish: false,
      canLike: false,
      canComment: false,
      canShare: false,
      canSave: false,
      canSchedule: false,
      supportedMedia: ["IMAGE", "VIDEO"],
      maxCharacterLimit: 2000,
    };
  }

  if (account) {
    const isConnected = account.status === "CONNECTED";
    const isExpired = account.status === "EXPIRED" || (account.tokenExpiresAt ? new Date(account.tokenExpiresAt) < new Date() : false);
    base.CONNECTED = isConnected;
    base.TOKEN_VALID = isConnected && !isExpired;
    base.ACCOUNT_SYNCED = Boolean(account.lastSyncedAt);
    if (!isConnected) {
      base.status = account.status === "DISCONNECTED" ? "CONFIGURATION REQUIRED" : (account.status as any) || "CONFIGURATION REQUIRED";
    }
  }

  return base;
}
