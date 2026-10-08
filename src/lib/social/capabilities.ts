/**
 * PulseSocial Platform Capabilities System
 * Declares strict real-world API capabilities for each supported social network.
 * If an action is not permitted by official platform APIs, it is marked unsupported
 * so that the UI never simulates fake operations.
 */

export interface PlatformCapability {
  platform: string;
  displayName: string;
  canPublish: boolean;
  canLike: boolean;
  canComment: boolean;
  canShare: boolean;
  canSave: boolean;
  canSchedule: boolean;
  supportedMedia: ("IMAGE" | "VIDEO" | "CAROUSEL" | "DOCUMENT")[];
  maxCharacterLimit: number;
  unsupportedMessage?: string;
}

export const PLATFORM_CAPABILITIES: Record<string, PlatformCapability> = {
  instagram: {
    platform: "instagram",
    displayName: "Instagram",
    canPublish: true,
    canLike: false, // Instagram Graph API does not allow programmatic likes
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "CAROUSEL"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "Programmatic likes are restricted by Meta Graph API policy.",
  },
  facebook: {
    platform: "facebook",
    displayName: "Facebook",
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
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO", "DOCUMENT"],
    maxCharacterLimit: 3000,
  },
  x: {
    platform: "x",
    displayName: "X (Twitter)",
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 280,
  },
  tiktok: {
    platform: "tiktok",
    displayName: "TikTok",
    canPublish: true,
    canLike: false,
    canComment: true,
    canShare: false,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 2200,
    unsupportedMessage: "TikTok Content Posting API permits direct video publish only.",
  },
  youtube: {
    platform: "youtube",
    displayName: "YouTube",
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["VIDEO"],
    maxCharacterLimit: 5000,
  },
  pinterest: {
    platform: "pinterest",
    displayName: "Pinterest",
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
    canPublish: true,
    canLike: false,
    canComment: true,
    canShare: true,
    canSave: false,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
  },
  googlebusiness: {
    platform: "googlebusiness",
    displayName: "Google Business Profile",
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
    canPublish: true,
    canLike: true,
    canComment: true,
    canShare: true,
    canSave: true,
    canSchedule: true,
    supportedMedia: ["IMAGE", "VIDEO"],
    maxCharacterLimit: 500,
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

  return {
    platform: norm,
    displayName: platform,
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
