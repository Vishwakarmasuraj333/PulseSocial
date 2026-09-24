"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ExternalLink,
  Check,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

export interface ChannelTabConfig {
  id: string;
  name: string;
  connectTitle: string;
  buttonLabel: string;
  buttonClass: string;
  realOAuthUrl: string;
  scopes: { name: string; description: string }[];
  description: string;
}

export const BRAND_CHANNELS: ChannelTabConfig[] = [
  {
    id: "youtube",
    name: "YouTube",
    connectTitle: "Connect your official YouTube channel.",
    buttonLabel: "Continue with YouTube",
    buttonClass: "bg-[#FF0000] hover:bg-[#E60000] text-white",
    realOAuthUrl: "/api/social/youtube/connect",
    description: "Connect your YouTube channel to schedule video uploads, manage Shorts, and analyze channel metrics.",
    scopes: [
      { name: "youtube.readonly", description: "View your YouTube account, channel statistics, and subscribers" },
      { name: "youtube.upload", description: "Manage and publish approved videos and shorts" },
      { name: "userinfo.profile", description: "Associate your authenticated YouTube channel profile" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    connectTitle: "Connect your official Facebook Page.",
    buttonLabel: "Continue with Facebook",
    buttonClass: "bg-[#1877F2] hover:bg-blue-700 text-white",
    realOAuthUrl: "/api/social/facebook/connect",
    description: "Connect your Facebook Pages to publish posts, schedule stories, and track audience engagement.",
    scopes: [
      { name: "pages_show_list", description: "Show the list of Facebook Pages you manage" },
      { name: "pages_read_engagement", description: "Read follower metrics, reach, and performance analytics" },
      { name: "pages_manage_posts", description: "Publish and schedule approved posts, photos, and reels" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    connectTitle: "Connect your official Instagram Professional Account.",
    buttonLabel: "Continue with Instagram",
    buttonClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white",
    realOAuthUrl: "/api/social/instagram/connect",
    description: "Connect your Instagram Professional Account for photo, reel, and carousel publishing.",
    scopes: [
      { name: "instagram_basic", description: "Read account profile, media objects, and basic details" },
      { name: "instagram_content_publish", description: "Publish photos, reels, and stories automatically" },
      { name: "instagram_manage_comments", description: "Moderate direct comments on published posts" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    connectTitle: "Connect your official LinkedIn profile or Company Page.",
    buttonLabel: "Continue with LinkedIn",
    buttonClass: "bg-[#0A66C2] hover:bg-blue-800 text-white",
    realOAuthUrl: "/api/social/linkedin/connect",
    description: "Connect your LinkedIn profile or Company Page to share professional articles and updates.",
    scopes: [
      { name: "openid", description: "Authenticate your LinkedIn identity securely" },
      { name: "profile", description: "Access your authorized name, profile photo, and headline" },
      { name: "email", description: "Verify primary communication email address" },
      { name: "w_member_social", description: "Publish posts, articles, and media on your behalf" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    connectTitle: "Connect your official TikTok account.",
    buttonLabel: "Continue with TikTok",
    buttonClass: "bg-black hover:bg-slate-900 text-white",
    realOAuthUrl: "/api/social/tiktok/connect",
    description: "Connect your TikTok account to manage and schedule short-form video publishing directly.",
    scopes: [
      { name: "user.info.basic", description: "Read your TikTok avatar, nickname, and account ID" },
      { name: "video.upload", description: "Upload video content directly to your TikTok account" },
      { name: "video.publish", description: "Publish verified videos to public feed" },
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    connectTitle: "Connect your official X account.",
    buttonLabel: "Continue with X",
    buttonClass: "bg-black hover:bg-slate-900 text-white",
    realOAuthUrl: "/api/social/x/connect",
    description: "Connect your X profile to post updates, threads, and monitor mentions in real-time.",
    scopes: [
      { name: "tweet.read", description: "Read your timeline and published posts" },
      { name: "tweet.write", description: "Post tweets, threads, and media on your behalf" },
      { name: "users.read", description: "Read verified account follower count and profile" },
      { name: "offline.access", description: "Maintain continuous token refresh for scheduled posts" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    connectTitle: "Connect your official Pinterest account.",
    buttonLabel: "Continue with Pinterest",
    buttonClass: "bg-[#E60023] hover:bg-red-800 text-white",
    realOAuthUrl: "/api/social/pinterest/connect",
    description: "Connect your Pinterest account to publish visual pins, link back to your site, and manage boards.",
    scopes: [
      { name: "boards:read", description: "Read public and private Pinterest boards" },
      { name: "boards:write", description: "Create and organize pin boards" },
      { name: "pins:read", description: "Read existing pin metrics and saves" },
      { name: "pins:write", description: "Create rich visual pins with destination links" },
    ],
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    connectTitle: "Connect your official Google Business Profile.",
    buttonLabel: "Continue with Google",
    buttonClass: "bg-[#4285F4] hover:bg-blue-600 text-white",
    realOAuthUrl: "/api/social/google_business/connect",
    description: "Connect your Google Business listing to publish local customer posts, offers, and store updates.",
    scopes: [
      { name: "business.manage", description: "Manage listings, local customer posts, and business hours" },
      { name: "userinfo.profile", description: "Identify verified business manager identity" },
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    connectTitle: "Connect your official Mastodon instance.",
    buttonLabel: "Continue with Mastodon",
    buttonClass: "bg-[#6364FF] hover:bg-[#5657E5] text-white",
    realOAuthUrl: "/api/social/mastodon/connect",
    description: "Connect your federated Mastodon instance to publish to the decentralized fediverse.",
    scopes: [
      { name: "read", description: "Read your public and private toots, mentions, and feeds" },
      { name: "write", description: "Publish federated status updates, toots, and media" },
      { name: "follow", description: "Manage follower relationships" },
    ],
  },
];

export interface ConnectedAccountData {
  id?: string;
  platform: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  providerAccountId?: string;
  scopes?: string[];
  followersCount?: number | null;
  postsCount?: number | null;
  metadata?: Record<string, any>;
}

interface UniversalSocialConnectModalProps {
  platformId?: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (channel?: any) => void;
}

export function UniversalSocialConnectModal({
  platformId = "youtube",
  isOpen,
  onClose,
  onSuccess,
}: UniversalSocialConnectModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [activeTab, setActiveTab] = useState<string>(platformId || "youtube");
  const [step, setStep] = useState<"connect" | "permissions" | "success">("connect");

  // OAuth states
  const [isOpeningOAuth, setIsOpeningOAuth] = useState(false);
  const [isOAuthWaiting, setIsOAuthWaiting] = useState(false);
  const [pendingAuthUrl, setPendingAuthUrl] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Real connected account data
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccountData | null>(null);

  // Sync active tab with platformId when opened
  useEffect(() => {
    if (platformId) {
      setActiveTab(platformId);
    }
    setStep("connect");
    setOauthError(null);
    setIsOAuthWaiting(false);
  }, [platformId, isOpen]);

  // Listen for real OAuth completion from child popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PULSESOCIAL_CHANNEL_CONNECTED" && event.data.account) {
        const acc = event.data.account;
        setConnectedAccount(acc);
        setIsOAuthWaiting(false);
        setIsOpeningOAuth(false);
        setStep("permissions");

        toast({
          title: "Authorization Confirmed!",
          message: `Official ${acc.displayName} account verified. Review permissions to link.`,
          type: "success",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [toast]);

  if (!isOpen) return null;

  const currentConfig =
    BRAND_CHANNELS.find((c) => c.id === activeTab) || BRAND_CHANNELS[0];

  // Launch official OAuth authorization directly in new window
  const handleLaunchOfficialOAuth = async () => {
    setOauthError(null);
    setIsOpeningOAuth(true);

    try {
      const res = await fetch(`/api/social/${activeTab}/connect?format=json`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.authUrl) {
        throw new Error(data.missingConfigMessage || "OAuth service unavailable. Please try again.");
      }

      setPendingAuthUrl(data.authUrl);
      setIsOAuthWaiting(true);

      // Open official provider in new tab/window
      const popup = window.open(data.authUrl, "_blank", "noopener,noreferrer,width=650,height=750");

      if (!popup) {
        toast({
          title: "Popup Blocked",
          message: "Please allow popups to authorize your account.",
          type: "info",
        });
      } else {
        toast({
          title: `Connecting to ${currentConfig.name}`,
          message: `Please complete authorization in the official ${currentConfig.name} window.`,
          type: "info",
        });
      }
    } catch (err: unknown) {
      setOauthError((err as Error).message || "Unable to initiate authorization.");
    } finally {
      setIsOpeningOAuth(false);
    }
  };

  // Final confirmation after reviewing permissions
  const handleConfirmLinkAccount = () => {
    setStep("success");
    toast({
      title: "Account Connected!",
      message: `${connectedAccount?.displayName} has been linked to ${activeBrand?.name || "your workspace"}.`,
      type: "success",
    });
    if (onSuccess) onSuccess(connectedAccount);
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess(connectedAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* ======================================================== */}
        {/* STEP 1: OFFICIAL OAUTH CONNECTION DIALOG (NO FAKE UI)    */}
        {/* ======================================================== */}
        {step === "connect" && (
          <div>
            {/* Header: Platform Icon + Connect [Platform] + Close X */}
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  {renderPlatformIcon(currentConfig.id, 28)}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Connect {currentConfig.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Official Channel Connection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Horizontal Strip */}
            <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 overflow-x-auto scrollbar-none flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">Switch:</span>
              {BRAND_CHANNELS.map((ch) => {
                const isActive = activeTab === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(ch.id);
                      setOauthError(null);
                      setIsOAuthWaiting(false);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      {renderPlatformIcon(ch.id, 14)}
                    </div>
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* OAuth Error Alert */}
              {oauthError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{oauthError}</span>
                </div>
              )}

              {/* Official OAuth Integration Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mx-auto flex items-center justify-center">
                  {renderPlatformIcon(currentConfig.id, 32)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentConfig.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {currentConfig.description}
                  </p>
                </div>

                {/* Big Action Button */}
                <button
                  type="button"
                  onClick={handleLaunchOfficialOAuth}
                  disabled={isOpeningOAuth}
                  className={`w-full py-3 px-4 rounded-xl ${currentConfig.buttonClass} font-semibold text-sm shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                >
                  {isOpeningOAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to {currentConfig.name}…</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>{currentConfig.buttonLabel}</span>
                    </>
                  )}
                </button>

                {/* Live Waiting Status when popup is open */}
                {isOAuthWaiting && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verifying your account in official window…
                    </span>
                    {pendingAuthUrl && (
                      <a
                        href={pendingAuthUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-slate-900 dark:hover:text-white font-semibold"
                      >
                        Re-open
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Security Guarantee */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero password sharing. Connects securely via official partner API.</span>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: REVIEW REAL PERMISSIONS & VERIFIED ACCOUNT       */}
        {/* ======================================================== */}
        {step === "permissions" && connectedAccount && (
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  {renderPlatformIcon(connectedAccount.platform, 28)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentConfig.name} Permissions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Channel Permissions Review
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated Account Preview */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-purple-700 overflow-hidden shrink-0">
                {connectedAccount.avatarUrl ? (
                  <img
                    src={connectedAccount.avatarUrl}
                    alt={connectedAccount.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  connectedAccount.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {connectedAccount.displayName}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {connectedAccount.username ? `@${connectedAccount.username}` : currentConfig.name}
                </p>
              </div>
            </div>

            {/* Granted Scopes */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                PulseSocial currently has permission to:
              </p>
              <div className="space-y-2">
                {currentConfig.scopes.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {s.name}
                      </span>
                      <span className="text-slate-500">{s.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Confirm Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep("connect")}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmLinkAccount}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Link Account</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: SUCCESS STATE                                    */}
        {/* ======================================================== */}
        {step === "success" && (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Connected Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {connectedAccount?.displayName} is now active and ready for publishing in PulseSocial.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Done & Return to Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
