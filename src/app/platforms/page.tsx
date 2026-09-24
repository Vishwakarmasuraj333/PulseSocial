"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export default function PlatformsPage() {
  const networks = [
    {
      id: "instagram",
      name: "Instagram Professional",
      type: "Business & Creator",
      desc: "Direct Graph API integration for Reels, multi-image carousels, and single image feeds. Native comments synchronization and audience discovery.",
      features: ["Reels auto-publishing", "Carousel posting with custom aspect ratio", "Comment replies and sentiment tracking", "Follower growth telemetry"],
    },
    {
      id: "facebook",
      name: "Facebook Pages & Groups",
      type: "Pages & Ads",
      desc: "Full Meta Business API access for page publishing, multi-photo updates, link cards, and page interaction monitoring.",
      features: ["Page post scheduling & immediate dispatch", "Reach and impression analytics", "Inbox direct message synchronization", "Post approval workflows"],
    },
    {
      id: "linkedin",
      name: "LinkedIn Pages & Profiles",
      type: "Enterprise & Thought Leadership",
      desc: "Official Community Management API and Sign In with LinkedIn using OpenID Connect. Publish rich articles and company updates.",
      features: ["Company page authoring", "Personal executive thought leadership", "Document and PDF presentation sharing", "Engagement telemetry"],
    },
    {
      id: "x",
      name: "X (Twitter) v2",
      type: "Real-Time Microblogging",
      desc: "Twitter API v2 integration with PKCE authorization. Schedule standalone posts, multi-post threads, and monitor brand mentions.",
      features: ["Thread composer and scheduler", "Media attachment upload", "Character limit warning & compliance", "Real-time mention alerts"],
    },
    {
      id: "youtube",
      name: "YouTube Channel & Shorts",
      type: "Video & Shorts",
      desc: "YouTube Data API v3 integration for video publishing, Shorts scheduling, community feed announcements, and view analytics.",
      features: ["YouTube Shorts auto-publishing", "Video title and description tags", "Community tab post scheduling", "View time and subscriber counts"],
    },
    {
      id: "tiktok",
      name: "TikTok Content Kit",
      type: "Short-Form Video",
      desc: "Direct Content Posting API integration. Schedule high-energy short-form video content with sound and caption tags.",
      features: ["Direct video upload with progress tracking", "Aspect ratio validation (9:16 vertical)", "Cover frame selection", "Virality telemetry"],
    },
    {
      id: "pinterest",
      name: "Pinterest Business",
      type: "Visual Discovery",
      desc: "Pinterest v5 API for rich product pins, board categorization, high-resolution visual curation, and outbound click analytics.",
      features: ["Product pin creation with destination links", "Custom board selector", "Pin scheduling with peak discovery time slots", "Saves and referral analytics"],
    },
    {
      id: "google_business",
      name: "Google Business Profile",
      type: "Local Commerce",
      desc: "Google My Business API for local storefronts, retail locations, customer review alerts, and special offer updates.",
      features: ["Location post publishing", "Customer reviews monitoring and quick replies", "Business hours and offer announcements", "Local search view telemetry"],
    },
    {
      id: "threads",
      name: "Meta Threads",
      type: "Conversational Feed",
      desc: "Official Threads API support for conversational text updates, image embeds, and community reply management.",
      features: ["Direct Threads posting", "Link embeds and media attachments", "Conversation replies and interactions", "Unified inbox support"],
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business Platform",
      type: "Direct Messaging",
      desc: "Cloud API support for customer support messages, catalog broadcasts, and automated quick responses.",
      features: ["Customer communication inbox", "Template message broadcasts", "Inquiry resolution tracking", "Multi-agent assignment"],
    },
    {
      id: "reddit",
      name: "Reddit API",
      type: "Community Discussions",
      desc: "OAuth-based Reddit integration for community announcements, brand discussions, and subreddit performance monitoring.",
      features: ["Subreddit post authoring", "Flair and link formatting", "Upvote and comment tracking", "Keyword brand monitoring"],
    },
    {
      id: "telegram",
      name: "Telegram Channels & Groups",
      type: "Broadcasting",
      desc: "Telegram Bot API for public channel broadcasts, rich formatted announcements, and subscriber engagement.",
      features: ["Instant message broadcasts", "Markdown and HTML formatting", "Media album attachments", "Channel view counters"],
    },
    {
      id: "discord",
      name: "Discord Communities",
      type: "Community Servers",
      desc: "Discord Webhook and Bot integrations for community announcements, product updates, and member notifications.",
      features: ["Rich embed message styling", "Channel selector", "Scheduled announcements", "Automated release notifications"],
    },
    {
      id: "snapchat",
      name: "Snapchat Spotlight",
      type: "Mobile Camera",
      desc: "Marketing API for creator Spotlight videos, public brand stories, and mobile audience discovery.",
      features: ["Spotlight video scheduling", "Lens and filter campaign tracking", "View counts and shares", "Vertical video validation"],
    },
    {
      id: "mastodon",
      name: "Mastodon Federated",
      type: "Decentralized",
      desc: "Open ActivityPub protocol integration for custom instances, federation monitoring, and decentralized publishing.",
      features: ["Custom instance authorization", "Toot publishing with CW flags", "Federated timeline monitoring", "Zero corporate vendor lock-in"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Certified Ecosystem
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            15+ Supported Social Networks
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every platform integration is built strictly on official public and partner APIs with secure cryptographic OAuth 2.0 flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networks.map((n) => (
            <div
              key={n.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {renderPlatformIcon(n.id, 24)}
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {n.type}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-950 dark:text-white mb-1.5">
                  {n.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {n.desc}
                </p>

                <div className="space-y-1.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
                  {n.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official API
                </span>
                <Link
                  href={`/api/social/${n.id}/connect`}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
