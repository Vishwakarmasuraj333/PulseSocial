"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Key,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

export interface ChannelCardConfig {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  learnMoreUrl?: string;
  actionText: string;
  buttonLabel: string;
  buttonClass: string;
  realOAuthUrl: string;
  description: string;
}

export const CHANNELS_CATALOG: ChannelCardConfig[] = [
  {
    id: "youtube",
    name: "YouTube",
    subtitle: "Channel",
    badge: "Official",
    actionText: "Connect",
    buttonLabel: "Continue with YouTube",
    buttonClass: "bg-[#FF0000] hover:bg-[#D90000] text-white shadow-xs hover:shadow-red-500/30",
    realOAuthUrl: "/api/social/youtube/connect",
    description:
      "Connect your YouTube channel to schedule video uploads, manage Shorts, and analyze channel metrics.",
  },
  {
    id: "instagram",
    name: "Instagram",
    subtitle: "Business or Creator accounts",
    badge: "Meta Direct",
    learnMoreUrl: "https://help.instagram.com",
    actionText: "Connect",
    buttonLabel: "Continue with Instagram",
    buttonClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white shadow-xs hover:shadow-pink-500/30",
    realOAuthUrl: "/api/social/instagram/connect",
    description:
      "Connect your Instagram Professional or Creator account to publish photos, carousels, video Reels, and auto-first comments.",
  },
  {
    id: "facebook",
    name: "Facebook",
    subtitle: "Page or Group",
    badge: "Meta Direct",
    actionText: "Connect",
    buttonLabel: "Continue with Facebook",
    buttonClass: "bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs hover:shadow-blue-500/30",
    realOAuthUrl: "/api/social/facebook/connect",
    description:
      "Connect your Facebook Business Pages or Groups to publish updates, albums, link previews, and Reels with reach analytics.",
  },
  {
    id: "twitter",
    name: "Twitter (X)",
    subtitle: "Profile",
    actionText: "Connect",
    buttonLabel: "Continue with X",
    buttonClass: "bg-black hover:bg-slate-900 text-white dark:bg-[#1DA1F2] dark:hover:bg-[#0c85d0] shadow-xs",
    realOAuthUrl: "/api/social/x/connect",
    description:
      "Connect your X / Twitter profile to publish real-time tweets, multi-tweet threads, images, and videos with 280-char tracking.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    subtitle: "Page or Profile",
    actionText: "Connect",
    buttonLabel: "Continue with LinkedIn",
    buttonClass: "bg-[#0A66C2] hover:bg-[#084e96] text-white shadow-xs hover:shadow-blue-600/30",
    realOAuthUrl: "/api/social/linkedin/connect",
    description:
      "Connect your LinkedIn personal profile or company pages to publish thought-leadership articles, documents, and news.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    subtitle: "Business account",
    learnMoreUrl: "https://support.tiktok.com/business",
    actionText: "Connect",
    buttonLabel: "Continue with TikTok",
    buttonClass: "bg-black hover:bg-slate-900 text-white shadow-xs hover:shadow-slate-900/30",
    realOAuthUrl: "/api/social/tiktok/connect",
    description:
      "Connect your TikTok Business or Creator account to publish vertical video reels, schedule posts, and track viewer growth.",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    subtitle: "Profile & Spotlight",
    badge: "New",
    actionText: "Connect",
    buttonLabel: "Continue with Snapchat",
    buttonClass: "bg-[#FFFC00] hover:bg-[#EBE800] text-slate-950 font-bold shadow-xs hover:shadow-yellow-500/30 border border-yellow-300",
    realOAuthUrl: "/api/social/snapchat/connect",
    description:
      "Connect your Snapchat profile and public story accounts to publish spotlight videos, stories, and track subscriber growth.",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    subtitle: "Business",
    actionText: "Connect",
    buttonLabel: "Continue with Pinterest",
    buttonClass: "bg-[#E60023] hover:bg-[#CC001F] text-white shadow-xs hover:shadow-red-600/30",
    realOAuthUrl: "/api/social/pinterest/connect",
    description:
      "Connect your Pinterest Business account to publish visual Pins, select targeted boards, and drive long-term organic traffic.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    subtitle: "Platform Messaging",
    badge: "Official",
    actionText: "Connect",
    buttonLabel: "Continue with WhatsApp",
    buttonClass: "bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs hover:shadow-emerald-500/30",
    realOAuthUrl: "/api/social/whatsapp/connect",
    description:
      "Connect your WhatsApp Business API endpoint to broadcast verified campaign messages, media brochures, and customer updates.",
  },
  {
    id: "threads",
    name: "Threads",
    subtitle: "Profile",
    actionText: "Connect",
    buttonLabel: "Continue with Threads",
    buttonClass: "bg-black hover:bg-slate-900 text-white shadow-xs",
    realOAuthUrl: "/api/social/threads/connect",
    description:
      "Connect your Instagram Threads profile to broadcast 500-character conversations, images, and short video clips.",
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    subtitle: "Account",
    actionText: "Connect",
    buttonLabel: "Continue with Google Business",
    buttonClass: "bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-xs hover:shadow-blue-500/30",
    realOAuthUrl: "/api/social/google-business/connect",
    description:
      "Connect your Google Business Profile to publish local updates, offers, and photos directly to Google Search and Google Maps.",
  },
  {
    id: "reddit",
    name: "Reddit",
    subtitle: "Subreddit Submissions",
    actionText: "Connect",
    buttonLabel: "Continue with Reddit",
    buttonClass: "bg-[#FF4500] hover:bg-[#D93A00] text-white shadow-xs hover:shadow-orange-500/30",
    realOAuthUrl: "/api/social/reddit/connect",
    description:
      "Connect your Reddit account to schedule posts across targeted subreddits, engage in community discussions, and track karma reach.",
  },
  {
    id: "telegram",
    name: "Telegram",
    subtitle: "Channel or Bot",
    actionText: "Connect",
    buttonLabel: "Continue with Telegram",
    buttonClass: "bg-[#24A1DE] hover:bg-[#1E8EC4] text-white shadow-xs hover:shadow-sky-500/30",
    realOAuthUrl: "/api/social/telegram/connect",
    description:
      "Connect your official Telegram Channel via BotFather token to broadcast rich announcements and photos instantly.",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    subtitle: "Profile",
    actionText: "Connect",
    buttonLabel: "Continue with Bluesky",
    buttonClass: "bg-[#1185FE] hover:bg-[#0A73DF] text-white shadow-xs hover:shadow-blue-500/30",
    realOAuthUrl: "/api/social/bluesky/connect",
    description:
      "Connect your Bluesky handle to broadcast decentralized updates over the authenticated AT Protocol network.",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    subtitle: "Profile",
    actionText: "Connect",
    buttonLabel: "Continue with Mastodon",
    buttonClass: "bg-[#6364FF] hover:bg-[#5253EA] text-white shadow-xs hover:shadow-indigo-500/30",
    realOAuthUrl: "/api/social/mastodon/connect",
    description:
      "Connect your Mastodon profile on any instance to publish federated toots, attach media, and engage with the Fediverse.",
  },
  {
    id: "shopify",
    name: "Shopify",
    subtitle: "Store",
    actionText: "Connect",
    buttonLabel: "Continue with Shopify",
    buttonClass: "bg-[#96BF48] hover:bg-[#7ea23b] text-white shadow-xs hover:shadow-emerald-500/30",
    realOAuthUrl: "/api/social/shopify/connect",
    description:
      "Connect your Shopify e-commerce store to sync product catalogs, publish new arrivals, and tag merchandise in social posts.",
  },
  {
    id: "start_page",
    name: "Start Page",
    subtitle: "A shareable landing page",
    actionText: "Create",
    buttonLabel: "Create Start Page",
    buttonClass: "bg-gradient-to-r from-[#F59E0B] via-[#E08738] to-[#D97706] hover:brightness-105 text-slate-950 font-bold shadow-xs",
    realOAuthUrl: "/posts/new",
    description:
      "Build a beautiful, high-converting bio link landing page to showcase all your social channels and latest campaigns.",
  },
];

export interface UniversalSocialConnectModalProps {
  isOpen?: boolean;
  title?: string;
  platformId?: string;
  initialPlatformId?: string;
  defaultChannelId?: string;
  onClose: () => void;
  onSuccess?: (accountData?: any) => void;
  onAccountConnected?: (accountData?: any) => void;
}

export function UniversalSocialConnectModal({
  isOpen = true,
  platformId,
  initialPlatformId,
  defaultChannelId,
  onClose,
  onSuccess,
  onAccountConnected,
}: UniversalSocialConnectModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [connectedAccountProviders, setConnectedAccountProviders] = useState<Set<string>>(new Set());
  const [connectingChannelId, setConnectingChannelId] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  // Manual developer token input state
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualPlatform, setManualPlatform] = useState("snapchat");
  const [manualToken, setManualToken] = useState("");
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load connected channels on open to mark cards as Connected
  const loadConnectedAccounts = async () => {
    try {
      const res = await fetch("/api/social/accounts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const provs = new Set<string>();
        if (Array.isArray(data.accounts)) {
          data.accounts.forEach((acc: any) => {
            if (acc.provider) {
              const p = acc.provider.toLowerCase();
              provs.add(p);
              if (p === "x") provs.add("twitter");
              if (p === "twitter") provs.add("x");
            }
          });
        }
        setConnectedAccountProviders(provs);
        return provs;
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    if (!isOpen) return;
    loadConnectedAccounts();
  }, [isOpen, activeBrand?.id]);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Listen to postMessage from OAuth callback popup
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "PULSESOCIAL_CHANNEL_CONNECTED" ||
        event.data?.type === "PULSESOCIAL_OAUTH_SUCCESS"
      ) {
        const acc = event.data.account || (event.data.accounts && event.data.accounts[0]);
        const provKey = (acc?.platform || acc?.provider || "").toLowerCase();

        if (provKey) {
          setConnectedAccountProviders((prev) => {
            const next = new Set(prev);
            next.add(provKey);
            if (provKey === "x") next.add("twitter");
            if (provKey === "twitter") next.add("x");
            return next;
          });
        }

        setConnectingChannelId(null);
        setOauthError(null);
        setFallbackUrl(null);

        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        toast({
          title: "Channel Connected!",
          message: `${acc?.displayName || "Social channel"} authorized successfully in your workspace.`,
          type: "success",
        });

        window.dispatchEvent(new Event("pulsesocial_account_connected"));
        if (onSuccess) onSuccess(acc);
        if (onAccountConnected) onAccountConnected(acc);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, onSuccess, onAccountConnected, toast]);

  if (!isOpen) return null;

  // SEAMLESS IN-POPUP OAUTH HANDLER (Leaves current tab completely intact)
  const handleLaunchChannelOAuth = async (ch: ChannelCardConfig) => {
    setOauthError(null);
    setFallbackUrl(null);
    setConnectingChannelId(ch.id);

    if (ch.id === "start_page") {
      onClose();
      router.push("/posts/new");
      return;
    }

    const targetApiId = ch.id === "twitter" ? "x" : ch.id;

    // Calculate centered popup coordinates
    const width = 560;
    const height = 740;
    const left = Math.max(0, Math.floor(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.floor(window.screenY + (window.outerHeight - height) / 2));

    // SYNCHRONOUS POPUP LAUNCH:
    // Calling window.open synchronously immediately in the click event ensures
    // that modern browser popup blockers (Chrome, Safari, Edge, Firefox) NEVER block it.
    const initialUrl = `/social/connect/${targetApiId}`;
    const popup = window.open(
      initialUrl,
      `pulsesocial_oauth_${targetApiId}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setOauthError(
        `Popup was blocked by your browser. Please click the button below to open authorization:`
      );
      setFallbackUrl(initialUrl);
      setConnectingChannelId(null);
      return;
    }

    // For official platforms (YouTube, Google Business, Facebook, LinkedIn, X, TikTok),
    // check if live third-party OAuth is configured:
    if (["youtube", "facebook", "linkedin", "x", "tiktok", "google_business"].includes(targetApiId)) {
      try {
        const res = await fetch(`/api/social/${targetApiId}/connect?format=json`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.authUrl && !data.authUrl.includes("/social/connect/")) {
            if (popup && !popup.closed) {
              popup.location.href = data.authUrl;
            }
          }
        }
      } catch (err) {
        console.error("OAuth init fetch error:", err);
      }
    }

    // Smooth polling while popup is open
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let attempts = 0;
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      const updatedProvs = await loadConnectedAccounts();

      if (
        updatedProvs &&
        (updatedProvs.has(ch.id) || (ch.id === "twitter" && updatedProvs.has("x")))
      ) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setConnectingChannelId(null);

        try {
          if (popup && !popup.closed) popup.close();
        } catch {}

        toast({
          title: "Channel Connected!",
          message: `${ch.name} successfully linked to your workspace.`,
          type: "success",
        });

        window.dispatchEvent(new Event("pulsesocial_account_connected"));
        if (onSuccess) onSuccess({ platform: ch.id });
        if (onAccountConnected) onAccountConnected({ platform: ch.id });
        return;
      }

      // Check if popup closed by user
      if (popup.closed) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setConnectingChannelId(null);
      }

      // Timeout after 3 minutes
      if (attempts > 90) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setConnectingChannelId(null);
      }
    }, 1500);
  };

  // Direct manual token submission for developer / testing mode
  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    setIsSubmittingToken(true);
    setOauthError(null);

    try {
      const targetProvider = manualPlatform === "twitter" ? "x" : manualPlatform;
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: targetProvider,
          accessToken: manualToken.trim(),
          brandId: activeBrand?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify access token");
      }

      toast({
        title: "Channel Connected!",
        message: `Successfully connected ${manualPlatform.toUpperCase()} to your workspace.`,
        type: "success",
      });

      await loadConnectedAccounts();
      window.dispatchEvent(new Event("pulsesocial_account_connected"));
      if (onSuccess) onSuccess(data);
      if (onAccountConnected) onAccountConnected(data);
      setManualToken("");
      setShowManualToken(false);
    } catch (err: any) {
      setOauthError(err.message || "Failed to link account with provided token.");
    } finally {
      setIsSubmittingToken(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connect your channels"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#17171A] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 ring-1 ring-purple-500/20 dark:ring-amber-500/20 w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col text-slate-900 dark:text-white animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100 dark:border-white/7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Connect your channels
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] mt-1 leading-relaxed">
              Looking for step-by-step instructions? Visit our Help Center to read our{" "}
              <button
                type="button"
                onClick={() => router.push("/resources")}
                className="font-bold text-[#E08738] hover:underline dark:text-[#F59E0B] cursor-pointer"
              >
                Getting Started
              </button>{" "}
              guides and learn about supported channel types.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer shrink-0 ml-4"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OAuth Feedback Alert */}
        {oauthError && (
          <div className="my-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="font-semibold">{oauthError}</p>
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Authorization Screen</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Full 3-Column Channels Cards Grid (Responsive, Spacious, Real Direct Actions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 py-4">
          {CHANNELS_CATALOG.map((ch) => {
            const isConnected =
              connectedAccountProviders.has(ch.id) ||
              (ch.id === "twitter" && connectedAccountProviders.has("x"));
            const isConnecting = connectingChannelId === ch.id;

            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-[#1C1C20] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 text-center hover:shadow-lg hover:border-amber-400/80 dark:hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-between min-h-[225px] relative group"
              >
                {/* Optional Pill Badge */}
                {ch.badge && (
                  <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#82C91E]/20 text-[#2B8A3E] dark:bg-emerald-950/60 dark:text-emerald-400 border border-[#82C91E]/30">
                    {ch.badge}
                  </span>
                )}

                {/* Platform Icon */}
                <div className="w-13 h-13 rounded-full flex items-center justify-center mb-2.5 mt-1 group-hover:scale-108 transition-transform duration-200">
                  {renderPlatformIcon(ch.id, 42)}
                </div>

                {/* Platform Name & Subtitle */}
                <div className="flex-1 flex flex-col justify-center mb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {ch.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {ch.subtitle}
                  </p>

                  {ch.learnMoreUrl && (
                    <a
                      href={ch.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#E08738] dark:hover:text-[#FBBF24] hover:underline mt-1 inline-flex items-center justify-center gap-1 transition"
                    >
                      <span>Learn more</span>
                      <span>→</span>
                    </a>
                  )}
                </div>

                {/* DIRECT ACTION BUTTON / CONNECTED BADGE */}
                {isConnected ? (
                  <div className="w-full space-y-1.5">
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Connected</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchChannelOAuth(ch)}
                      disabled={isConnecting}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      {isConnecting ? "Reconnecting..." : "Reconnect"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLaunchChannelOAuth(ch)}
                    disabled={isConnecting}
                    className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 shadow-xs hover:shadow-md ${ch.buttonClass}`}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ch.buttonLabel}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Developer Direct Token Entry Collapsible */}
        <div className="mt-2 pt-4 border-t border-slate-100 dark:border-white/7">
          <button
            type="button"
            onClick={() => setShowManualToken(!showManualToken)}
            className="text-[11px] font-semibold text-slate-500 hover:text-[#E08738] dark:hover:text-[#FBBF24] transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3 h-3" />
            <span>
              {showManualToken
                ? "Hide direct token entry"
                : "Developer / Tester: Paste Access Token directly"}
            </span>
          </button>

          {showManualToken && (
            <form
              onSubmit={handleManualTokenSubmit}
              className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Channel
                  </label>
                  <select
                    value={manualPlatform}
                    onChange={(e) => setManualPlatform(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] text-slate-900 dark:text-white"
                  >
                    {CHANNELS_CATALOG.filter((c) => c.id !== "start_page").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Access Token / Bearer Key
                  </label>
                  <input
                    type="password"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste EAAB... or Bearer token here"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#E08738]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingToken || !manualToken.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#E08738] to-[#D97706] hover:brightness-105 text-slate-950 text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-[0.98]"
                >
                  {isSubmittingToken ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Connect Directly</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Back Navigation */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/7 mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-[#9CA3AF] hover:text-[#E08738] dark:hover:text-[#FBBF24] flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>

          <span className="text-[11px] text-slate-400 dark:text-[#6B7280] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AES-256 Zero-Knowledge Encrypted</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default UniversalSocialConnectModal;
