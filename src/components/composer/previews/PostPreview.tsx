"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PreviewAccount, PreviewMediaItem, FacebookPostPreview } from "./FacebookPostPreview";
import { InstagramPostPreview } from "./InstagramPostPreview";
import { LinkedInPostPreview } from "./LinkedInPostPreview";
import { XPostPreview } from "./XPostPreview";
import { TikTokPostPreview } from "./TikTokPostPreview";
import { YouTubePostPreview } from "./YouTubePostPreview";
import { PinterestPostPreview } from "./PinterestPostPreview";
import { ThreadsPostPreview } from "./ThreadsPostPreview";
import { GoogleBusinessPostPreview } from "./GoogleBusinessPostPreview";
import { MastodonPostPreview } from "./MastodonPostPreview";

export type SupportedPlatformKey =
  | "linkedin"
  | "instagram"
  | "x"
  | "facebook"
  | "youtube"
  | "threads"
  | "tiktok"
  | "pinterest"
  | "google";

export interface PlatformTabOption {
  key: SupportedPlatformKey;
  label: string;
  provider: string;
  defaultHeadline: string;
}

export const ALL_PREVIEW_PLATFORMS: PlatformTabOption[] = [
  { key: "linkedin", label: "LinkedIn", provider: "LINKEDIN", defaultHeadline: "Company Page · 1st" },
  { key: "instagram", label: "Instagram", provider: "INSTAGRAM", defaultHeadline: "Official Profile" },
  { key: "x", label: "X (Twitter)", provider: "TWITTER", defaultHeadline: "Verified Organization" },
  { key: "facebook", label: "Facebook", provider: "FACEBOOK", defaultHeadline: "Official Page" },
  { key: "youtube", label: "YouTube", provider: "YOUTUBE", defaultHeadline: "Official Channel" },
  { key: "threads", label: "Threads", provider: "THREADS", defaultHeadline: "Official Account" },
  { key: "tiktok", label: "TikTok", provider: "TIKTOK", defaultHeadline: "Creator Profile" },
  { key: "pinterest", label: "Pinterest", provider: "PINTEREST", defaultHeadline: "Business Account" },
  { key: "google", label: "Google Business", provider: "GOOGLE_BUSINESS", defaultHeadline: "Verified Business" },
];

export interface PostPreviewProps {
  accounts?: PreviewAccount[];
  activeAccountId?: string;
  onSelectAccount?: (id: string) => void;
  onOpenConnectModal?: () => void;
  content: string;
  media: PreviewMediaItem[];
  location?: string | null;
  linkData?: { url: string; title: string; description: string; domain: string } | null;
  firstComment?: string | null;
  youtubeTitle?: string;
  isShorts?: boolean;
  brandName?: string;
  brandAvatar?: string;
  brandHandle?: string;
}

export function PostPreview({
  accounts = [],
  activeAccountId,
  onSelectAccount,
  onOpenConnectModal,
  content,
  media,
  location,
  linkData,
  firstComment,
  youtubeTitle,
  isShorts,
  brandName = "Suraj Vishwakarma",
  brandAvatar = "/icons/pulse-logo.svg",
  brandHandle = "@surajvishwakarma",
}: PostPreviewProps) {
  // Determine starting platform based on connected accounts or default to linkedin
  const initialPlatform: SupportedPlatformKey = useMemo(() => {
    if (accounts && accounts.length > 0) {
      const active = accounts.find((a) => a.id === activeAccountId) || accounts[0];
      const p = (active.provider || "").toLowerCase();
      if (p.includes("linkedin")) return "linkedin";
      if (p.includes("instagram")) return "instagram";
      if (p.includes("x") || p.includes("twitter")) return "x";
      if (p.includes("facebook")) return "facebook";
      if (p.includes("youtube")) return "youtube";
      if (p.includes("thread")) return "threads";
      if (p.includes("tiktok")) return "tiktok";
      if (p.includes("pinterest")) return "pinterest";
      if (p.includes("google")) return "google";
    }
    return "linkedin";
  }, [accounts, activeAccountId]);

  const [activePlatform, setActivePlatform] = useState<SupportedPlatformKey>(initialPlatform);

  // Keep in sync if activeAccountId or accounts change
  useEffect(() => {
    if (activeAccountId && accounts.length > 0) {
      const match = accounts.find((a) => a.id === activeAccountId);
      if (match) {
        const p = match.provider.toLowerCase();
        if (p.includes("linkedin")) setActivePlatform("linkedin");
        else if (p.includes("instagram")) setActivePlatform("instagram");
        else if (p.includes("x") || p.includes("twitter")) setActivePlatform("x");
        else if (p.includes("facebook")) setActivePlatform("facebook");
        else if (p.includes("youtube")) setActivePlatform("youtube");
        else if (p.includes("thread")) setActivePlatform("threads");
        else if (p.includes("tiktok")) setActivePlatform("tiktok");
        else if (p.includes("pinterest")) setActivePlatform("pinterest");
        else if (p.includes("google")) setActivePlatform("google");
      }
    }
  }, [activeAccountId, accounts]);

  // Find if an authentic connected account matches the selected platform
  const matchingConnectedAccount = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    return accounts.find((a) => {
      const prov = (a.provider || "").toLowerCase();
      if (activePlatform === "x") return prov.includes("x") || prov.includes("twitter");
      if (activePlatform === "threads") return prov.includes("thread");
      if (activePlatform === "google") return prov.includes("google");
      return prov.includes(activePlatform);
    }) || null;
  }, [accounts, activePlatform]);

  // Fallback simulated account so preview is 100% realistic and never blocked
  const effectiveAccount: PreviewAccount = useMemo(() => {
    if (matchingConnectedAccount) {
      return matchingConnectedAccount;
    }

    const platformDef = ALL_PREVIEW_PLATFORMS.find((p) => p.key === activePlatform);
    const cleanHandle = brandHandle ? (brandHandle.startsWith("@") ? brandHandle : `@${brandHandle}`) : "@surajvishwakarma";

    return {
      id: `sim-${activePlatform}`,
      provider: platformDef?.provider || "LINKEDIN",
      displayName: brandName || "Suraj Vishwakarma",
      username: cleanHandle,
      profileImageUrl: brandAvatar || "/icons/pulse-logo.svg",
      accountType: platformDef?.defaultHeadline || "Verified Channel",
    };
  }, [matchingConnectedAccount, activePlatform, brandHandle, brandName, brandAvatar]);

  return (
    <div className="space-y-3">
      {/* Dynamic Platform-Specific Live Preview Renderers */}
      {activePlatform === "linkedin" && (
        <LinkedInPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          linkData={linkData}
          firstComment={firstComment}
        />
      )}

      {activePlatform === "instagram" && (
        <InstagramPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          location={location}
          firstComment={firstComment}
        />
      )}

      {activePlatform === "x" && (
        <XPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          location={location}
        />
      )}

      {activePlatform === "facebook" && (
        <FacebookPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          location={location}
          linkData={linkData}
          firstComment={firstComment}
        />
      )}

      {activePlatform === "youtube" && (
        <YouTubePostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          title={youtubeTitle}
          isShorts={isShorts}
        />
      )}

      {activePlatform === "threads" && (
        <ThreadsPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
        />
      )}

      {activePlatform === "tiktok" && (
        <TikTokPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
        />
      )}

      {activePlatform === "pinterest" && (
        <PinterestPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
        />
      )}

      {activePlatform === "google" && (
        <GoogleBusinessPostPreview
          account={effectiveAccount}
          content={content}
          media={media}
          ctaUrl={linkData?.url}
        />
      )}
    </div>
  );
}

export type { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";
export { FacebookPostPreview } from "./FacebookPostPreview";
export { InstagramPostPreview } from "./InstagramPostPreview";
export { LinkedInPostPreview } from "./LinkedInPostPreview";
export { XPostPreview } from "./XPostPreview";
export { TikTokPostPreview } from "./TikTokPostPreview";
export { YouTubePostPreview } from "./YouTubePostPreview";
export { PinterestPostPreview } from "./PinterestPostPreview";
export { ThreadsPostPreview } from "./ThreadsPostPreview";
export { GoogleBusinessPostPreview } from "./GoogleBusinessPostPreview";
export { MastodonPostPreview } from "./MastodonPostPreview";

