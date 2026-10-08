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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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
    CONNECTED: true,
    TOKEN_VALID: true,
    ACCOUNT_SYNCED: true,
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

export function getPlatformCapability(platform: string): PlatformCapability {
  const norm = platform.toLowerCase().replace(/[^a-z]/g, "");
  if (norm.includes("facebook")) return PLATFORM_CAPABILITIES.facebook;
  if (norm.includes("instagram")) return PLATFORM_CAPABILITIES.instagram;
  if (norm.includes("linkedin")) return PLATFORM_CAPABILITIES.linkedin;
  if (norm.includes("x") || norm.includes("twitter")) return PLATFORM_CAPABILITIES.x;
  if (norm.includes("tiktok")) return PLATFORM_CAPABILITIES.tiktok;
  if (norm.includes("youtube")) return PLATFORM_CAPABILITIES.youtube;
  if (norm.includes("pinterest")) return PLATFORM_CAPABILITIES.pinterest;
  if (norm.includes("thread")) return PLATFORM_CAPABILITIES.threads;
  if (norm.includes("google")) return PLATFORM_CAPABILITIES.googlebusiness;
  if (norm.includes("mastodon")) return PLATFORM_CAPABILITIES.mastodon;
  if (norm.includes("telegram")) return PLATFORM_CAPABILITIES.telegram;
  if (norm.includes("reddit")) return PLATFORM_CAPABILITIES.reddit;
  if (norm.includes("bluesky")) return PLATFORM_CAPABILITIES.bluesky;
  if (norm.includes("snapchat")) return PLATFORM_CAPABILITIES.snapchat;

  return {
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
