/**
 * PulseSocial Platform Capabilities System
 * Declares strict real-world API capabilities, versioning, and compliance states
 * for each supported social network.
 */

export type PlatformIntegrationStatus =
  | "PRODUCTION READY"
  | "CONFIGURED — WAITING FOR TIKTOK APPROVAL"
  | "CONFIGURED — YOUTUBE API AUDIT REQUIRED FOR PUBLIC UPLOADS"
  | "CONFIGURED — EXTERNAL APPROVAL REQUIRED"
  | "CONFIGURED — API LIMITATION"
  | "CONNECTED — PUBLISHING NOT AVAILABLE"
  | "REQUIRES DEVELOPER CONFIGURATION"
  | "BLOCKED"
  | "NOT IMPLEMENTED";

export interface PlatformCapability {
  platform: string;
  displayName: string;
  apiVersion: string;
  status: PlatformIntegrationStatus;
  approvalRequired: boolean;
  publicVisibilityAllowed: boolean;
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
    apiVersion: "Graph API v20.0",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: false, // Meta Graph API policy restricts programmatic likes
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "CAROUSEL"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "Programmatic likes are restricted by Meta Graph API policy.",
    notes: "Requires Instagram Professional/Creator account connected to a Facebook Page.",
  },
  facebook: {
    platform: "facebook",
    displayName: "Facebook",
    apiVersion: "Graph API v20.0",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "CAROUSEL"],
    maxCharacterLimit: 63206,
  },
  linkedin: {
    platform: "linkedin",
    displayName: "LinkedIn",
    apiVersion: "REST Posts API (202401)",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
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
    apiVersion: "Twitter API v2",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 280,
    notes: "Enforces 280 character limit and OAuth 2.0 PKCE authentication.",
  },
  tiktok: {
    platform: "tiktok",
    displayName: "TikTok",
    apiVersion: "Content Posting API v2",
    status: "CONFIGURED — WAITING FOR TIKTOK APPROVAL",
    approvalRequired: true,
    publicVisibilityAllowed: false,
    canPublish: false, // Blocked pending TikTok partner approval
    canLike: false,
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "TikTok Content Posting API permits direct video publish only with verified developer approval.",
    notes: "Direct Video Posting requires developer application audit approval from TikTok.",
  },
  youtube: {
    platform: "youtube",
    displayName: "YouTube",
    apiVersion: "YouTube Data API v3",
    status: "CONFIGURED — YOUTUBE API AUDIT REQUIRED FOR PUBLIC UPLOADS",
    approvalRequired: true,
    publicVisibilityAllowed: false,
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 5000,
    notes: "Uploads succeed as private videos until Google Cloud Project completes the third-party verification audit.",
  },
  pinterest: {
    platform: "pinterest",
    displayName: "Pinterest",
    apiVersion: "Pinterest API v5",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: true,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
  },
  threads: {
    platform: "threads",
    displayName: "Threads",
    apiVersion: "Threads API v1.0",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: false,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
    notes: "Two-step media container and publishing via official Graph API.",
  },
  googlebusiness: {
    platform: "googlebusiness",
    displayName: "Google Business Profile",
    apiVersion: "Business Profile API v4",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE"],
    maxCharacterLimit: 1500,
  },
  mastodon: {
    platform: "mastodon",
    displayName: "Mastodon",
    apiVersion: "Mastodon REST API v1",
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
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
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
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
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
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
    status: "PRODUCTION READY",
    approvalRequired: false,
    publicVisibilityAllowed: true,
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
    approvalRequired: true,
    publicVisibilityAllowed: false,
    canPublish: false,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: false,
    canSchedule: false,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 250,
    unsupportedMessage: "Story posting via standard API token is restricted by Snap Inc.",
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
    status: "REQUIRES DEVELOPER CONFIGURATION",
    approvalRequired: false,
    publicVisibilityAllowed: true,
    canPublish: true,
    canLike: false,
    canComment: false,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 2000,
  };
}
