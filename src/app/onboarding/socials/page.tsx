"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { socialService, SocialAccount } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import { Search, CheckCircle2, ArrowRight, Sparkles, ExternalLink, ShieldCheck, X } from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";

interface PlatformDef {
  id: string;
  name: string;
  category: "social" | "video" | "professional" | "business" | "messaging" | "publishing";
  description: string;
  oauthUrl: string;
}

const SUPPORTED_PLATFORMS: PlatformDef[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    description: "Publish, schedule and analyze reels, carousels, and stories.",
    oauthUrl: "/api/social/instagram/connect",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "social",
    description: "Manage business pages, groups, ad engagement, and audience reach.",
    oauthUrl: "/api/social/facebook/connect",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "professional",
    description: "Publish professional thought leadership, company pages, and articles.",
    oauthUrl: "/api/social/linkedin/connect",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "social",
    description: "Real-time updates, threads, viral engagement, and smart mentions.",
    oauthUrl: "/api/social/x/connect",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "video",
    description: "Schedule shorts, video uploads, community posts, and track view metrics.",
    oauthUrl: "/api/social/youtube/connect",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "video",
    description: "Trend discovery, auto-publishing video shorts, and virality analytics.",
    oauthUrl: "/api/social/tiktok/connect",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "publishing",
    description: "Grow visual traffic, schedule rich pins, and manage product boards.",
    oauthUrl: "/api/social/pinterest/connect",
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    category: "business",
    description: "Manage local search visibility, customer reviews, and business updates.",
    oauthUrl: "/api/social/google-business/connect",
  },
  {
    id: "threads",
    name: "Threads",
    category: "social",
    description: "Engage conversational audiences and sync meta text discussions.",
    oauthUrl: "/api/social/threads/connect",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "messaging",
    description: "Customer broadcasts, catalog updates, and automated inquiry replies.",
    oauthUrl: "/api/social/whatsapp/connect",
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "social",
    description: "Community subreddits, viral discussions, and upvote tracking.",
    oauthUrl: "/api/social/reddit/connect",
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "messaging",
    description: "Public announcement channels, private community groups, and broadcast bots.",
    oauthUrl: "/api/social/telegram/connect",
  },
  {
    id: "discord",
    name: "Discord",
    category: "messaging",
    description: "Server webhooks, community engagement channels, and member announcements.",
    oauthUrl: "/api/social/discord/connect",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "video",
    description: "Snap Spotlight, story scheduling, and brand lens performance.",
    oauthUrl: "/api/social/snapchat/connect",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    category: "publishing",
    description: "Federated decentralized social publishing and instance monitoring.",
    oauthUrl: "/api/social/mastodon/connect",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    category: "social",
    description: "Open AT protocol publishing, custom feeds, and handle verification.",
    oauthUrl: "/api/social/bluesky/connect",
  },
];

function SocialConnectInner() {
  const router = useRouter();
  const { toast } = useToast();

  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingPlatformId, setConnectingPlatformId] = useState<string | null>(null);

  const loadConnectedAccounts = () => {
    socialService.getAccounts().then((accounts) => {
      setConnectedIds(accounts.map((a) => a.provider.toLowerCase()));
    }).catch(() => {});
  };

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const filteredPlatforms = SUPPORTED_PLATFORMS.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenConnect = (platform: PlatformDef) => {
    setConnectingPlatformId(platform.id);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-8">
        <PulseSocialLogo size="md" theme="light" variant="with-tagline" />
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {/* Title & Subheading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mb-3">
            Workspace Onboarding
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Connect your social accounts
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Bring your social channels into one powerful workspace. Publish content,
            streamline customer replies, and analyze unified engagement metrics.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl backdrop-blur-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search social platforms..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Networks" },
              { id: "social", label: "Social" },
              { id: "professional", label: "Professional" },
              { id: "video", label: "Video" },
              { id: "messaging", label: "Messaging" },
              { id: "business", label: "Business" },
              { id: "publishing", label: "Publishing" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlatforms.map((platform) => {
            const isConnected = connectedIds.includes(platform.id);

            return (
              <div
                key={platform.id}
                className="group relative rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-xl"
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                      {renderPlatformIcon(platform.id, 28)}
                    </div>

                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {platform.category}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition">
                    {platform.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {platform.description}
                  </p>
                </div>

                {/* Action Button */}
                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConnectedIds((prev) => prev.filter((id) => id !== platform.id));
                      toast({
                        title: "Account Disconnected",
                        message: `${platform.name} has been disconnected.`,
                        type: "info",
                      });
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConnect(platform)}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Connect {platform.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Bar: Finish Onboarding */}
      <div className="w-full max-w-6xl mx-auto pt-8 flex items-center justify-between border-t border-slate-800/80 mt-8 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>OAuth 2.0 PKCE Hardened Security. PulseSocial never stores your raw passwords.</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
        >
          <span>Complete Setup & Open Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* UNIVERSAL SOCIAL CONNECTION MODAL                            */}
      {/* ============================================================ */}
      <UniversalSocialConnectModal
        isOpen={!!connectingPlatformId}
        platformId={connectingPlatformId || undefined}
        onClose={() => setConnectingPlatformId(null)}
        onSuccess={() => {
          loadConnectedAccounts();
          setConnectingPlatformId(null);
        }}
      />
    </div>
  );
}

export default function SocialOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19]" />}>
      <SocialConnectInner />
    </Suspense>
  );
}
