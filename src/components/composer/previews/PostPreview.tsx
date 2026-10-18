"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Wifi,
  Battery,
  Signal,
  Layers,
} from "lucide-react";
import {
  renderPlatformIcon,
  SnapchatIcon,
  WhatsAppIcon,
  RedditIcon,
  BlueskyIcon,
} from "@/components/icons/PlatformIcons";
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
  | "google"
  | "mastodon"
  | "snapchat"
  | "whatsapp"
  | "reddit"
  | "bluesky";

export type DevicePreviewMode = "mobile" | "tablet" | "desktop";

export interface PlatformTabOption {
  key: SupportedPlatformKey;
  label: string;
  provider: string;
  defaultHeadline: string;
  characterLimit: number;
}

export const ALL_PREVIEW_PLATFORMS: PlatformTabOption[] = [
  { key: "linkedin", label: "LinkedIn", provider: "LINKEDIN", defaultHeadline: "Company Page · 1st", characterLimit: 3000 },
  { key: "instagram", label: "Instagram", provider: "INSTAGRAM", defaultHeadline: "Official Profile", characterLimit: 2200 },
  { key: "x", label: "X (Twitter)", provider: "TWITTER", defaultHeadline: "Verified Organization", characterLimit: 280 },
  { key: "facebook", label: "Facebook", provider: "FACEBOOK", defaultHeadline: "Official Page", characterLimit: 63206 },
  { key: "youtube", label: "YouTube", provider: "YOUTUBE", defaultHeadline: "Official Channel", characterLimit: 5000 },
  { key: "threads", label: "Threads", provider: "THREADS", defaultHeadline: "Official Account", characterLimit: 500 },
  { key: "tiktok", label: "TikTok", provider: "TIKTOK", defaultHeadline: "Creator Profile", characterLimit: 2200 },
  { key: "pinterest", label: "Pinterest", provider: "PINTEREST", defaultHeadline: "Business Account", characterLimit: 500 },
  { key: "google", label: "Google Business", provider: "GOOGLE_BUSINESS", defaultHeadline: "Verified Business", characterLimit: 1500 },
  { key: "mastodon", label: "Mastodon", provider: "MASTODON", defaultHeadline: "Federated Instance Profile", characterLimit: 500 },
  { key: "snapchat", label: "Snapchat", provider: "SNAPCHAT", defaultHeadline: "Spotlight & Stories", characterLimit: 250 },
  { key: "whatsapp", label: "WhatsApp", provider: "WHATSAPP", defaultHeadline: "Verified Business Channel", characterLimit: 4096 },
  { key: "reddit", label: "Reddit", provider: "REDDIT", defaultHeadline: "r/Community Post", characterLimit: 40000 },
  { key: "bluesky", label: "Bluesky", provider: "BLUESKY", defaultHeadline: "AT Protocol Handle", characterLimit: 300 },
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
  hideHeaderControls?: boolean;
  defaultDeviceMode?: DevicePreviewMode;
  forcedPlatform?: SupportedPlatformKey;
  onPlatformChange?: (platform: SupportedPlatformKey) => void;
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
  brandName = "PulseSocial Workspace",
  brandAvatar = "/icons/pulse-logo.svg",
  brandHandle = "@workspace",
  hideHeaderControls = false,
  defaultDeviceMode = "desktop",
  forcedPlatform,
  onPlatformChange,
}: PostPreviewProps) {
  // Determine starting platform based on connected accounts, forcedPlatform, or default to linkedin
  const initialPlatform: SupportedPlatformKey = useMemo(() => {
    if (forcedPlatform) return forcedPlatform;
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
      if (p.includes("mastodon")) return "mastodon";
    }
    return "linkedin";
  }, [accounts, activeAccountId, forcedPlatform]);

  const [activePlatform, setActivePlatform] = useState<SupportedPlatformKey>(initialPlatform);
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>(defaultDeviceMode);

  // Keep in sync if forcedPlatform changes
  useEffect(() => {
    if (forcedPlatform) {
      setActivePlatform(forcedPlatform);
    }
  }, [forcedPlatform]);

  // Keep in sync if activeAccountId or accounts change
  useEffect(() => {
    if (activeAccountId && accounts.length > 0) {
      const match = accounts.find((a) => a.id === activeAccountId);
      if (match) {
        const p = match.provider.toLowerCase();
        let target: SupportedPlatformKey = "linkedin";
        if (p.includes("linkedin")) target = "linkedin";
        else if (p.includes("instagram")) target = "instagram";
        else if (p.includes("x") || p.includes("twitter")) target = "x";
        else if (p.includes("facebook")) target = "facebook";
        else if (p.includes("youtube")) target = "youtube";
        else if (p.includes("thread")) target = "threads";
        else if (p.includes("tiktok")) target = "tiktok";
        else if (p.includes("pinterest")) target = "pinterest";
        else if (p.includes("google")) target = "google";
        else if (p.includes("mastodon")) target = "mastodon";
        setActivePlatform(target);
      }
    }
  }, [activeAccountId, accounts]);

  const handleSelectPlatform = (key: SupportedPlatformKey) => {
    setActivePlatform(key);
    if (onPlatformChange) {
      onPlatformChange(key);
    }
    if (onSelectAccount && accounts.length > 0) {
      const matched = accounts.find((a) => {
        const prov = (a.provider || "").toLowerCase();
        if (key === "x") return prov.includes("x") || prov.includes("twitter");
        if (key === "threads") return prov.includes("thread");
        if (key === "google") return prov.includes("google");
        return prov.includes(key);
      });
      if (matched) {
        onSelectAccount(matched.id);
      }
    }
  };

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
    const cleanHandle = brandHandle ? (brandHandle.startsWith("@") ? brandHandle : `@${brandHandle}`) : "@workspace";

    return {
      id: `sim-${activePlatform}`,
      provider: platformDef?.provider || "LINKEDIN",
      displayName: brandName || "PulseSocial Workspace",
      username: cleanHandle,
      profileImageUrl: brandAvatar || "/icons/pulse-logo.svg",
      accountType: platformDef?.defaultHeadline || "Verified Channel",
    };
  }, [matchingConnectedAccount, activePlatform, brandHandle, brandName, brandAvatar]);

  const activeDef = useMemo(() => {
    return ALL_PREVIEW_PLATFORMS.find((p) => p.key === activePlatform) || ALL_PREVIEW_PLATFORMS[0];
  }, [activePlatform]);

  const isOverLimit = content.length > activeDef.characterLimit;

  return (
    <div className="w-full space-y-3" id="post-preview-root">
      {/* ============================================================ */}
      {/* PREVIEW TOOLBAR: CLEAN, COMPACT, NO CLUTTER                  */}
      {/* ============================================================ */}
      {!hideHeaderControls && (
        <div className="p-3 rounded-2xl bg-white dark:bg-[#151518] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-2.5">
          {/* Top Bar: Platform Name + Connected Badge + Device Switcher */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-[#E08738]/15 border border-purple-200 dark:border-[#E08738]/40 flex items-center justify-center text-[#5846A8] dark:text-[#FBBF24]">
                {renderPlatformIcon(activePlatform, 16)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeDef.label} Preview
                </span>
                {matchingConnectedAccount ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
                    Preview
                  </span>
                )}
              </div>
            </div>

            {/* Device Switcher (Mobile / Desktop) + Inline Char Limit */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono font-medium ${
                  isOverLimit
                    ? "text-rose-600 font-bold"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {content.length}/{activeDef.characterLimit}
              </span>

              <div
                className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10"
                role="group"
                aria-label="Device simulation modes"
              >
                <button
                  type="button"
                  id="preview-mode-mobile"
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    deviceMode === "mobile"
                      ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-xs"
                      : "text-slate-500 hover:text-[#5846A8] dark:text-slate-400 dark:hover:text-white"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>

                <button
                  type="button"
                  id="preview-mode-desktop"
                  onClick={() => setDeviceMode("desktop")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    deviceMode === "desktop"
                      ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-xs"
                      : "text-slate-500 hover:text-[#5846A8] dark:text-slate-400 dark:hover:text-white"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Social Platform Channel Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {ALL_PREVIEW_PLATFORMS.map((plat) => {
              const isSelected = activePlatform === plat.key;
              const hasConnectedAcc = accounts.some((a) => {
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
                  id={`preview-tab-${plat.key}`}
                  onClick={() => handleSelectPlatform(plat.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#5846A8] text-white shadow-xs dark:bg-[#E08738] dark:text-[#0F0F11]"
                      : "bg-slate-100 hover:bg-purple-50 hover:text-[#5846A8] text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:hover:text-[#FBBF24] border border-slate-200/70 dark:border-white/5"
                  }`}
                  title={`Preview on ${plat.label}`}
                >
                  <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    {renderPlatformIcon(plat.key, 14)}
                  </div>
                  <span>{plat.label}</span>
                  {hasConnectedAcc && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DEVICE FRAME SIMULATOR WRAPPER (MOBILE / DESKTOP)            */}
      {/* ============================================================ */}
      <div className="transition-all duration-200">
        {deviceMode === "mobile" ? (
          <div className="max-w-[390px] mx-auto rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-md overflow-hidden bg-white dark:bg-[#111113]">
            <div className="p-3 bg-slate-50/50 dark:bg-[#0D0D0E]/80">
              <div className="rounded-xl overflow-hidden shadow-xs">
                {renderActivePreview()}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs overflow-hidden bg-white dark:bg-[#111113]">
            <div className="p-3 sm:p-4">
              {renderActivePreview()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper renderer for active platform simulator
  function renderActivePreview() {
    switch (activePlatform) {
      case "linkedin":
        return (
          <LinkedInPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            linkData={linkData}
            firstComment={firstComment}
          />
        );
      case "instagram":
        return (
          <InstagramPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            location={location}
            firstComment={firstComment}
          />
        );
      case "x":
        return (
          <XPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            location={location}
          />
        );
      case "facebook":
        return (
          <FacebookPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            location={location}
            linkData={linkData}
            firstComment={firstComment}
          />
        );
      case "youtube":
        return (
          <YouTubePostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            title={youtubeTitle}
            isShorts={isShorts}
          />
        );
      case "threads":
        return (
          <ThreadsPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
          />
        );
      case "tiktok":
        return (
          <TikTokPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
          />
        );
      case "pinterest":
        return (
          <PinterestPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
          />
        );
      case "google":
        return (
          <GoogleBusinessPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            ctaUrl={linkData?.url}
          />
        );
      case "mastodon":
        return (
          <MastodonPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
          />
        );
      case "snapchat":
        return (
          <div className="bg-black text-white rounded-2xl overflow-hidden border border-yellow-400/40 shadow-xl max-w-sm mx-auto">
            <div className="flex items-center justify-between p-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFFC00] flex items-center justify-center p-1 border border-yellow-400">
                  <SnapchatIcon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {effectiveAccount.displayName || "Snapchat User"}
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00]" />
                  </h4>
                  <span className="text-[10px] text-yellow-300">Snapchat Spotlight</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFC00] text-black">
                Subscribe
              </span>
            </div>
            <div className="relative aspect-[9/16] max-h-[380px] bg-slate-900 flex items-center justify-center overflow-hidden">
              {media.length > 0 ? (
                media[0].type === "video" ? (
                  <video src={media[0].url} className="w-full h-full object-cover" controls playsInline />
                ) : (
                  <img src={media[0].url} alt="Snap media" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-[#FFFC00] flex items-center justify-center mx-auto">
                    <SnapchatIcon size={28} />
                  </div>
                  <p className="text-xs text-slate-300">Attach vertical media (9:16) for Snapchat Spotlight & Stories</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-10 text-left">
                <p className="text-xs font-medium text-white line-clamp-3">
                  {content || "Your caption will appear here on Snapchat Spotlight."}
                </p>
              </div>
            </div>
          </div>
        );
      case "whatsapp":
        return (
          <div className="bg-[#EFEAE2] dark:bg-[#0B141A] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl max-w-sm mx-auto font-sans">
            <div className="flex items-center gap-2.5 p-3 bg-[#075E54] text-white">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center p-1">
                <WhatsAppIcon size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{effectiveAccount.displayName || "WhatsApp Channel"}</h4>
                <span className="text-[10px] text-emerald-200">Verified Broadcast Channel</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-white dark:bg-[#1F2C34] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] space-y-2 border border-black/5 dark:border-white/5">
                {media.length > 0 && (
                  <div className="rounded-xl overflow-hidden">
                    <img src={media[0].url} alt="WhatsApp media" className="w-full max-h-48 object-cover" />
                  </div>
                )}
                <p className="text-xs whitespace-pre-wrap leading-relaxed">
                  {content || "Your WhatsApp broadcast message will appear here."}
                </p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 dark:text-slate-400">
                  <span>Just now</span>
                  <span className="text-sky-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "reddit":
        return (
          <div className="bg-white dark:bg-[#1A1A1B] text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl max-w-md mx-auto font-sans">
            <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#FF4500] flex items-center justify-center">
                <RedditIcon size={16} />
              </div>
              <span className="font-bold">r/socialmedia</span>
              <span className="text-[10px] text-slate-400">• Posted by u/{effectiveAccount.username || "creator"}</span>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-bold leading-snug">
                {content ? content.slice(0, 80) : "Post Title"}
              </h3>
              {content && content.length > 80 && (
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {content.slice(80)}
                </p>
              )}
              {media.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={media[0].url} alt="Reddit media" className="w-full max-h-64 object-cover" />
                </div>
              )}
            </div>
          </div>
        );
      case "bluesky":
        return (
          <div className="bg-white dark:bg-[#161e27] text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden border border-sky-500/30 shadow-xl max-w-md mx-auto p-4 space-y-3 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1185FE] flex items-center justify-center">
                <BlueskyIcon size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold">{effectiveAccount.displayName || "Bluesky Creator"}</h4>
                <span className="text-[10px] text-slate-400">@{effectiveAccount.username || "user.bsky.social"}</span>
              </div>
            </div>
            <p className="text-xs whitespace-pre-wrap leading-relaxed">
              {content || "Your Bluesky post will appear here across the AT Protocol."}
            </p>
            {media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={media[0].url} alt="Bluesky media" className="w-full max-h-64 object-cover" />
              </div>
            )}
          </div>
        );
      default:
        return (
          <LinkedInPostPreview
            account={effectiveAccount}
            content={content}
            media={media}
            linkData={linkData}
            firstComment={firstComment}
          />
        );
    }
  }
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
