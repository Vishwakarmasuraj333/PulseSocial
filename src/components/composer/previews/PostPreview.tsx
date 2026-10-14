"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
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
import { Plus } from "lucide-react";

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
  brandName = "Pulse Media Global",
  brandAvatar = "/icons/pulse-logo.svg",
  brandHandle = "@pulsemedia",
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
    const cleanHandle = brandHandle ? (brandHandle.startsWith("@") ? brandHandle : `@${brandHandle}`) : "@pulsemedia";

    return {
      id: `sim-${activePlatform}`,
      provider: platformDef?.provider || "LINKEDIN",
      displayName: brandName || "Pulse Media Global",
      username: cleanHandle,
      profileImageUrl: brandAvatar || "/icons/pulse-logo.svg",
      accountType: platformDef?.defaultHeadline || "Verified Channel",
      isVerified: true,
    };
  }, [matchingConnectedAccount, activePlatform, brandName, brandAvatar, brandHandle]);

  const handlePlatformSelect = (key: SupportedPlatformKey) => {
    setActivePlatform(key);
    // If a connected account exists for this platform, notify parent
    const match = (accounts || []).find((a) => {
      const prov = (a.provider || "").toLowerCase();
      if (key === "x") return prov.includes("x") || prov.includes("twitter");
      if (key === "threads") return prov.includes("thread");
      if (key === "google") return prov.includes("google");
      return prov.includes(key);
    });
    if (match && onSelectAccount) {
      onSelectAccount(match.id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Platform Preview Selector Bar supporting ALL platforms */}
      <div className="bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
          {ALL_PREVIEW_PLATFORMS.map((plat) => {
            const isSelected = activePlatform === plat.key;
            const hasConnected = (accounts || []).some((a) => {
              const prov = (a.provider || "").toLowerCase();
              if (plat.key === "x") return prov.includes("x") || prov.includes("twitter");
              if (plat.key === "threads") return prov.includes("thread");
              if (plat.key === "google") return prov.includes("google");
              return prov.includes(plat.key);
            });

            return (
              <button
                key={plat.key}
                type="button"
                onClick={() => handlePlatformSelect(plat.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-[#5846A8] text-white border-[#5846A8] shadow-xs scale-[1.02]"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                title={`Preview on ${plat.label}${hasConnected ? " (Connected)" : " (Live Simulator)"}`}
              >
                {renderPlatformIcon(plat.provider, 13)}
                <span>{plat.label}</span>
                {hasConnected ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                    title="Connected Channel Active"
                  />
                ) : (
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1 py-0.2 rounded font-mono ${
                      isSelected ? "bg-white/20 text-white" : "text-slate-400"
                    }`}
                  >
                    Sim
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discreet helper bar when viewing simulated platform */}
      {!matchingConnectedAccount && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300">
          <span className="truncate">
            Live {ALL_PREVIEW_PLATFORMS.find((p) => p.key === activePlatform)?.label} Preview &middot; Updates as you type
          </span>
          {onOpenConnectModal && (
            <button
              type="button"
              onClick={onOpenConnectModal}
              className="inline-flex items-center gap-1 text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Connect Account
            </button>
          )}
        </div>
      )}

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

export type { PreviewAccount, PreviewMediaItem };
export {
  FacebookPostPreview,
  InstagramPostPreview,
  LinkedInPostPreview,
  XPostPreview,
  TikTokPostPreview,
  YouTubePostPreview,
  PinterestPostPreview,
  ThreadsPostPreview,
  GoogleBusinessPostPreview,
  MastodonPostPreview,
};
