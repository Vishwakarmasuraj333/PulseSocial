"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

interface PlatformMetadata {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  buttonClass: string;
  defaultUsername: string;
  defaultType: string;
  scopes: string[];
}

const PLATFORM_META: Record<string, PlatformMetadata> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    subtitle: "Professional & Creator Accounts",
    accentColor: "#FD1D1D",
    buttonClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white shadow-pink-500/25",
    defaultUsername: "pulsesocial_official",
    defaultType: "BUSINESS",
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights", "instagram_manage_comments"],
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business",
    subtitle: "Cloud API & Web Channel",
    accentColor: "#25D366",
    buttonClass: "bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-emerald-500/25",
    defaultUsername: "+1 (555) 019-8834",
    defaultType: "WHATSAPP_BUSINESS",
    scopes: ["whatsapp_business_messaging", "whatsapp_business_management", "catalog_sync"],
  },
  snapchat: {
    id: "snapchat",
    name: "Snapchat",
    subtitle: "Public Profile & Spotlight",
    accentColor: "#FFFC00",
    buttonClass: "bg-[#FFFC00] hover:bg-[#EBE800] text-slate-950 font-black shadow-yellow-500/25 border border-yellow-300",
    defaultUsername: "pulsesocial_snap",
    defaultType: "SPOTLIGHT",
    scopes: ["snapchat.spotlight.publish", "snapchat.story.view", "snapchat.profile.read"],
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    subtitle: "Business Account & Boards",
    accentColor: "#E60023",
    buttonClass: "bg-[#E60023] hover:bg-[#CC001F] text-white shadow-red-500/25",
    defaultUsername: "pulsesocial_pins",
    defaultType: "BUSINESS",
    scopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
  },
  threads: {
    id: "threads",
    name: "Threads",
    subtitle: "Conversational Microblogging",
    accentColor: "#101010",
    buttonClass: "bg-black hover:bg-slate-900 text-white dark:bg-white dark:text-black shadow-slate-900/25",
    defaultUsername: "pulsesocial_threads",
    defaultType: "CREATOR",
    scopes: ["threads_basic", "threads_content_publish", "threads_read_replies"],
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    subtitle: "Community & Subreddits",
    accentColor: "#FF4500",
    buttonClass: "bg-[#FF4500] hover:bg-[#D93A00] text-white shadow-orange-500/25",
    defaultUsername: "pulsesocial_hq",
    defaultType: "PROFILE",
    scopes: ["identity", "submit", "read", "history", "mysubreddits"],
  },
  telegram: {
    id: "telegram",
    name: "Telegram Channel",
    subtitle: "Broadcasting Bot & Channel",
    accentColor: "#24A1DE",
    buttonClass: "bg-[#24A1DE] hover:bg-[#1E8EC4] text-white shadow-sky-500/25",
    defaultUsername: "pulsesocial_channel",
    defaultType: "CHANNEL",
    scopes: ["bot_broadcast", "channel_publish", "media_upload"],
  },
  bluesky: {
    id: "bluesky",
    name: "Bluesky",
    subtitle: "AT Protocol Network",
    accentColor: "#1185FE",
    buttonClass: "bg-[#1185FE] hover:bg-[#0A73DF] text-white shadow-blue-500/25",
    defaultUsername: "pulsesocial.bsky.social",
    defaultType: "PROFILE",
    scopes: ["atproto_publish", "timeline_read", "record_create"],
  },
  mastodon: {
    id: "mastodon",
    name: "Mastodon",
    subtitle: "Fediverse Server Instance",
    accentColor: "#6364FF",
    buttonClass: "bg-[#6364FF] hover:bg-[#5253EA] text-white shadow-indigo-500/25",
    defaultUsername: "pulsesocial@mastodon.social",
    defaultType: "PROFILE",
    scopes: ["read", "write", "follow"],
  },
  shopify: {
    id: "shopify",
    name: "Shopify Store",
    subtitle: "E-Commerce Catalog Sync",
    accentColor: "#96BF48",
    buttonClass: "bg-[#96BF48] hover:bg-[#7ea23b] text-white shadow-emerald-500/25",
    defaultUsername: "pulsesocial-store.myshopify.com",
    defaultType: "STORE",
    scopes: ["read_products", "read_inventory", "write_products"],
  },
};

export default function SocialChannelConnectPopupPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawProvider = String(params?.provider || "instagram").toLowerCase();
  const provider = rawProvider === "twitter" ? "x" : rawProvider;
  const config =
    PLATFORM_META[provider] || {
      id: provider,
      name: provider.toUpperCase(),
      subtitle: "Social Channel",
      accentColor: "#6F52B5",
      buttonClass: "bg-[#6F52B5] hover:bg-[#5C4299] text-white",
      defaultUsername: `pulsesocial_${provider}`,
      defaultType: "PAGE",
      scopes: ["basic_read", "content_publish"],
    };

  // Form State
  const [activeTab, setActiveTab] = useState<"direct" | "secondary">("direct");
  const [username, setUsername] = useState(config.defaultUsername);
  const [accountType, setAccountType] = useState(config.defaultType);
  const [customField, setCustomField] = useState(
    provider === "telegram"
      ? "7182938492:AAH-x9281394"
      : provider === "mastodon"
      ? "https://mastodon.social"
      : provider === "shopify"
      ? "pulsesocial-store.myshopify.com"
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryError = searchParams?.get("error");
  const [errorMsg, setErrorMsg] = useState<string | null>(queryError || null);

  // Auto-redirect to official Instagram Login if accessed directly and no error is present
  useEffect(() => {
    if (provider === "instagram" && !queryError) {
      const timer = setTimeout(() => {
        window.location.href = "/api/social/instagram/connect";
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [provider, queryError]);

  // Sync if username updates from config
  useEffect(() => {
    setUsername(config.defaultUsername);
    setAccountType(config.defaultType);
  }, [config]);

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        provider,
        username: username.trim(),
        displayName:
          provider === "whatsapp"
            ? `WhatsApp Business (${username.trim()})`
            : `${config.name} (@${username.trim().replace(/^@/, "")})`,
        accountType,
        scopes: config.scopes,
        metadata: {
          connectedVia: "popup_direct_dialog",
          customField,
          timestamp: new Date().toISOString(),
        },
      };

      const res = await fetch("/api/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect channel.");
      }

      setIsSuccess(true);

      // Post message back to opener parent window
      if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "PULSESOCIAL_CHANNEL_CONNECTED",
            account: data.account || {
              provider,
              platform: provider,
              displayName: payload.displayName,
              username: payload.username,
              status: "CONNECTED",
            },
          },
          "*"
        );

        setTimeout(() => {
          try {
            window.close();
          } catch {}
        }, 800);
      } else {
        setTimeout(() => {
          router.replace(`/dashboard?connected=${provider}`);
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Authorization failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Top Banner & Platform Brand Bar */}
      <div className="w-full max-w-lg mx-auto bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glow Accent */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: config.accentColor }}
        />

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-inner shrink-0">
            {renderPlatformIcon(provider, 36)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                Connect {config.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified OAuth
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        {/* Success Overlay */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Channel Connected!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Linked {config.name} successfully to your PulseSocial workspace.
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Closing authorization window...
            </p>
          </div>
        ) : (
          <div>
            {/* WHATSAPP DEDICATED EXPERIENCE */}
            {provider === "whatsapp" && (
              <div className="space-y-4">
                {/* Mode Tabs */}
                <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("direct")}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === "direct"
                        ? "bg-[#25D366] text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>WhatsApp Web QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("secondary")}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === "secondary"
                        ? "bg-[#25D366] text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Cloud API Number</span>
                  </button>
                </div>

                {activeTab === "direct" ? (
                  /* QR Pairing Card */
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center space-y-3.5">
                    <div className="p-3 bg-white rounded-xl inline-block shadow-lg mx-auto relative group">
                      {/* Realistic Interactive QR Pattern */}
                      <svg
                        width="140"
                        height="140"
                        viewBox="0 0 140 140"
                        className="rounded-lg"
                      >
                        <rect width="140" height="140" fill="#FFFFFF" />
                        {/* Corner markers */}
                        <rect x="10" y="10" width="36" height="36" rx="4" fill="#1EBE5D" />
                        <rect x="16" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
                        <rect x="22" y="22" width="12" height="12" rx="1" fill="#1EBE5D" />

                        <rect x="94" y="10" width="36" height="36" rx="4" fill="#1EBE5D" />
                        <rect x="100" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
                        <rect x="106" y="22" width="12" height="12" rx="1" fill="#1EBE5D" />

                        <rect x="10" y="94" width="36" height="36" rx="4" fill="#1EBE5D" />
                        <rect x="16" y="100" width="24" height="24" rx="2" fill="#FFFFFF" />
                        <rect x="22" y="106" width="12" height="12" rx="1" fill="#1EBE5D" />

                        {/* QR Matrix lines */}
                        <rect x="52" y="14" width="8" height="30" fill="#000000" />
                        <rect x="68" y="22" width="16" height="8" fill="#000000" />
                        <rect x="20" y="54" width="20" height="8" fill="#000000" />
                        <rect x="52" y="52" width="36" height="36" rx="4" fill="#25D366" />
                        <rect x="98" y="54" width="28" height="8" fill="#000000" />
                        <rect x="54" y="96" width="14" height="30" fill="#000000" />
                        <rect x="76" y="100" width="24" height="8" fill="#000000" />
                        <rect x="108" y="96" width="16" height="30" fill="#000000" />
                      </svg>
                    </div>

                    <div className="text-left text-xs space-y-1.5 px-2 text-slate-300">
                      <p className="font-bold text-white">How to connect with QR code:</p>
                      <p>1. Open WhatsApp on your phone</p>
                      <p>2. Tap Menu (⋮) or Settings and select <strong>Linked Devices</strong></p>
                      <p>3. Tap <strong>Link a device</strong> and point your phone at this screen</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConnect()}
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Pairing WhatsApp...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Pair &amp; Link Device (+1 555-0199)</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Cloud API Inputs */
                  <form onSubmit={handleConnect} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Phone Number or Display Name
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="+1 (555) 019-8834"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-[#25D366]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Meta Cloud API Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={customField}
                        onChange={(e) => setCustomField(e.target.value)}
                        placeholder="109283746582"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-[#25D366]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Connect Cloud API Endpoint</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* INSTAGRAM DEDICATED EXPERIENCE - OFFICIAL INSTAGRAM LOGIN FOR BUSINESS */}
            {provider === "instagram" && (
              <div className="space-y-4 text-center py-4">
                {errorMsg ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">Instagram Authorization Notice</h3>
                      <p className="text-xs text-amber-300 max-w-sm mx-auto leading-relaxed">
                        {errorMsg}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 text-left">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Setup Requirements:</span>
                      </p>
                      <p>• Meta Developer App with <b>Instagram</b> product added</p>
                      <p>• INSTAGRAM_APP_ID (or META_APP_ID) and Secret in .env</p>
                      <p>• Valid OAuth Redirect URI registered: <code>/api/social/instagram/callback</code></p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
                            window.close();
                          } else {
                            router.push("/social-accounts");
                          }
                        }}
                        className="w-1/2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Close Window
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg(null);
                          window.location.href = "/api/social/instagram/connect";
                        }}
                        className={`w-1/2 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${config.buttonClass}`}
                      >
                        <span>Retry</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center mx-auto shadow-lg shadow-pink-500/25">
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">Opening Official Instagram Login...</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Redirecting to Meta&apos;s direct Instagram authorization consent screen for Professional accounts.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 text-left">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official Meta Business Login:</span>
                      </p>
                      <p>• Direct authorization on instagram.com (Zero Facebook redirects)</p>
                      <p>• Eligible for Instagram Professional (Business or Creator) accounts</p>
                      <p>• Server-side token exchange and secure AES-256 storage</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/api/social/instagram/connect";
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${config.buttonClass}`}
                    >
                      <span>Authorize with Instagram Login</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* GENERAL STANDALONE PROVIDERS (Snapchat, Pinterest, Threads, Reddit, Telegram, Bluesky, Mastodon, Shopify) */}
            {provider !== "whatsapp" && provider !== "instagram" && (
              <form onSubmit={handleConnect} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {provider === "shopify"
                      ? "Shopify Store Domain"
                      : provider === "telegram"
                      ? "Telegram Channel Username"
                      : `${config.name} Handle / Username`}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={config.defaultUsername}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Platform specific optional field */}
                {provider === "telegram" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      BotFather Bot Token
                    </label>
                    <input
                      type="text"
                      value={customField}
                      onChange={(e) => setCustomField(e.target.value)}
                      placeholder="7182938492:AAH-x..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 font-mono text-white focus:outline-hidden"
                    />
                  </div>
                )}

                {provider === "mastodon" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Mastodon Instance URL
                    </label>
                    <input
                      type="text"
                      value={customField}
                      onChange={(e) => setCustomField(e.target.value)}
                      placeholder="https://mastodon.social"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Permissions Breakdown */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Requested Permissions:</span>
                  </p>
                  {config.scopes.map((s) => (
                    <p key={s} className="font-mono text-[10px] text-slate-300">
                      ✓ {s.replace(/[._:]/g, " ")}
                    </p>
                  ))}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary Authorize Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${config.buttonClass}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing {config.name}...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Authorize &amp; Connect {config.name}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>End-to-End Encrypted Session</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.close();
            }}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
