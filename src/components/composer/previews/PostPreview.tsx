"use client";

import React, { useState } from "react";
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
import { Sparkles, Plus, Layers } from "lucide-react";

interface PostPreviewProps {
  accounts: PreviewAccount[];
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
}

export function PostPreview({
  accounts,
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
}: PostPreviewProps) {
  // If multiple accounts are selected, track active tab locally if not provided
  const [localActiveId, setLocalActiveId] = useState<string>(accounts[0]?.id || "");

  const effectiveActiveId = activeAccountId || localActiveId;
  const currentAccount =
    accounts.find((a) => a.id === effectiveActiveId) || accounts[0];

  const handleTabClick = (id: string) => {
    setLocalActiveId(id);
    if (onSelectAccount) onSelectAccount(id);
  };

  // Empty state: No accounts selected
  if (!accounts || accounts.length === 0 || !currentAccount) {
    return (
      <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
          <Layers className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          No channel selected
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
          Select or connect a verified social channel at the top of the composer to see its live platform preview.
        </p>
        {onOpenConnectModal && (
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Social Account</span>
          </button>
        )}
      </div>
    );
  }

  const provider = currentAccount.provider.toLowerCase();

  return (
    <div className="space-y-3">
      {/* Multi-Account Preview Tabs */}
      {accounts.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {accounts.map((acc) => {
            const isSelected = acc.id === currentAccount.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleTabClick(acc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-xs"
                    : "bg-slate-100/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/60"
                }`}
              >
                {renderPlatformIcon(acc.provider, 13)}
                <span className="truncate max-w-[90px]">{acc.displayName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic Platform-Specific Renderer */}
      {provider.includes("facebook") && (
        <FacebookPostPreview
          account={currentAccount}
          content={content}
          media={media}
          location={location}
          linkData={linkData}
          firstComment={firstComment}
        />
      )}

      {provider.includes("instagram") && (
        <InstagramPostPreview
          account={currentAccount}
          content={content}
          media={media}
          location={location}
          firstComment={firstComment}
        />
      )}

      {provider.includes("linkedin") && (
        <LinkedInPostPreview
          account={currentAccount}
          content={content}
          media={media}
          linkData={linkData}
          firstComment={firstComment}
        />
      )}

      {(provider.includes("x") || provider.includes("twitter")) && (
        <XPostPreview
          account={currentAccount}
          content={content}
          media={media}
          location={location}
        />
      )}

      {provider.includes("tiktok") && (
        <TikTokPostPreview
          account={currentAccount}
          content={content}
          media={media}
        />
      )}

      {provider.includes("youtube") && (
        <YouTubePostPreview
          account={currentAccount}
          content={content}
          media={media}
          title={youtubeTitle}
          isShorts={isShorts}
        />
      )}

      {provider.includes("pinterest") && (
        <PinterestPostPreview
          account={currentAccount}
          content={content}
          media={media}
          destinationUrl={linkData?.url}
        />
      )}

      {provider.includes("thread") && (
        <ThreadsPostPreview
          account={currentAccount}
          content={content}
          media={media}
        />
      )}

      {provider.includes("google") && (
        <GoogleBusinessPostPreview
          account={currentAccount}
          content={content}
          media={media}
          ctaUrl={linkData?.url}
        />
      )}

      {provider.includes("mastodon") && (
        <MastodonPostPreview
          account={currentAccount}
          content={content}
          media={media}
        />
      )}

      {/* Fallback if none matched */}
      {!provider.includes("facebook") &&
        !provider.includes("instagram") &&
        !provider.includes("linkedin") &&
        !provider.includes("x") &&
        !provider.includes("twitter") &&
        !provider.includes("tiktok") &&
        !provider.includes("youtube") &&
        !provider.includes("pinterest") &&
        !provider.includes("thread") &&
        !provider.includes("google") &&
        !provider.includes("mastodon") && (
          <FacebookPostPreview
            account={currentAccount}
            content={content}
            media={media}
            location={location}
            linkData={linkData}
            firstComment={firstComment}
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
