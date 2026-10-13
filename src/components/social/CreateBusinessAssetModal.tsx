"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlusCircle,
  Info,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";

interface CreateBusinessAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectExisting: (platformId: string) => void;
}

interface PlatformCapability {
  id: string;
  name: string;
  assetType: string;
  supportsApiCreation: boolean;
  officialCreationUrl: string;
  explanation: string;
}

const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: "facebook",
    name: "Facebook",
    assetType: "Business Page",
    supportsApiCreation: false, // Meta Graph API v19+ requires Meta Business Manager direct verification
    officialCreationUrl: "https://www.facebook.com/pages/creation/",
    explanation:
      "Meta requires Facebook Business Pages to be initialized directly through the Meta Business Suite or Facebook Page Creation Portal to ensure 2-factor authentication and business ownership compliance.",
  },
  {
    id: "instagram",
    name: "Instagram",
    assetType: "Professional / Business Account",
    supportsApiCreation: false,
    officialCreationUrl: "https://www.instagram.com/accounts/emailsignup/",
    explanation:
      "Instagram Professional accounts must be created or converted through the Instagram app or Web Portal, then linked to a Facebook Page for Graph API access.",
  },
  {
    id: "youtube",
    name: "YouTube",
    assetType: "YouTube Channel / Brand Account",
    supportsApiCreation: false,
    officialCreationUrl: "https://www.youtube.com/create_channel",
    explanation:
      "Google requires YouTube Channels to be created directly on YouTube with phone-verified Google account credentials.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    assetType: "Company Page",
    supportsApiCreation: false,
    officialCreationUrl: "https://www.linkedin.com/company/setup/new/",
    explanation:
      "LinkedIn Company Pages require verification of company email domain and personal LinkedIn administrator rights through the LinkedIn setup portal.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    assetType: "Business Account",
    supportsApiCreation: false,
    officialCreationUrl: "https://ads.tiktok.com/business-account/",
    explanation:
      "TikTok Business Accounts must be registered through TikTok for Business to establish commercial music and advertising compliance.",
  },
  {
    id: "x",
    name: "X (Twitter)",
    assetType: "Account / Organization",
    supportsApiCreation: false,
    officialCreationUrl: "https://twitter.com/i/flow/signup",
    explanation:
      "X user profiles and verified organizations must be registered directly through x.com.",
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    assetType: "Business Location / Listing",
    supportsApiCreation: false,
    officialCreationUrl: "https://www.google.com/business/",
    explanation:
      "Google Business Profiles require physical address verification via postcard, video, or phone directly through Google Maps & Search portal.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    assetType: "WhatsApp Cloud API Account",
    supportsApiCreation: false,
    officialCreationUrl: "https://business.facebook.com/wa/manage/",
    explanation:
      "WhatsApp Business accounts require Meta Business Manager registration and phone number registration via Meta WhatsApp Cloud API portal.",
  },
  {
    id: "telegram",
    name: "Telegram",
    assetType: "Bot / Channel",
    supportsApiCreation: false,
    officialCreationUrl: "https://t.me/BotFather",
    explanation:
      "Telegram Bots must be registered with @BotFather on Telegram to receive an authentic bot token.",
  },
  {
    id: "reddit",
    name: "Reddit",
    assetType: "Subreddit / Profile",
    supportsApiCreation: false,
    officialCreationUrl: "https://www.reddit.com/subreddits/create",
    explanation:
      "Subreddits require an established Reddit account with positive karma and minimum account age directly on reddit.com.",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    assetType: "Instance Account",
    supportsApiCreation: false,
    officialCreationUrl: "https://joinmastodon.org/servers",
    explanation:
      "Mastodon accounts are tied to specific federated instances chosen by the user.",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    assetType: "AT Protocol Handle",
    supportsApiCreation: false,
    officialCreationUrl: "https://bsky.app",
    explanation:
      "Bluesky accounts are created directly on the AT Protocol network through bsky.app.",
  },
];

export function CreateBusinessAssetModal({
  isOpen,
  onClose,
  onConnectExisting,
}: CreateBusinessAssetModalProps) {
  const { toast } = useToast();
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("facebook");
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPlatform =
    PLATFORM_CAPABILITIES.find((p) => p.id === selectedPlatformId) ||
    PLATFORM_CAPABILITIES[0];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Page / Business Asset
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official platform asset provisioning and compliance guidelines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Platform Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Social Network
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {PLATFORM_CAPABILITIES.map((platform) => {
                const isSelected = selectedPlatformId === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatformId(platform.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-600/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {renderPlatformIcon(platform.id, 16)}
                    </div>
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Platform Information Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center">
                  {renderPlatformIcon(currentPlatform.id, 20)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentPlatform.name} {currentPlatform.assetType}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentPlatform.supportsApiCreation
                      ? "Programmatic API Creation Supported"
                      : "Direct Platform Setup Required"}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentPlatform.supportsApiCreation
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                }`}
              >
                {currentPlatform.supportsApiCreation
                  ? "Direct API"
                  : "External Creation"}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentPlatform.explanation}
            </p>
          </div>

          {/* Creation Flow: Direct Portal */}
          <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Official Platform Workflow:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-blue-700 dark:text-blue-400">
                    <li>
                      Create or initialize your {currentPlatform.assetType} directly on {currentPlatform.name}.
                    </li>
                    <li>
                      Ensure your account has administrator or publisher rights.
                    </li>
                    <li>
                      Return to PulseSocial and click &quot;Connect Existing Account&quot; to authorize publishing via real OAuth.
                    </li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={currentPlatform.officialCreationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open {currentPlatform.name} Portal</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConnectExisting(currentPlatform.id);
                  }}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connect Existing Account</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
