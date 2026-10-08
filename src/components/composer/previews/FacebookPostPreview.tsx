"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export interface PreviewAccount {
  id: string;
  provider: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  accountType?: string;
  isRealConnected?: boolean;
  publishingStatus?:
    | "Ready to publish"
    | "Connected — Publishing approval required"
    | "Connected configuration incomplete"
    | "Reauthorization required";
  publishingAvailable?: boolean;
  tokenStatus?: "VALID" | "EXPIRED" | "MISSING";
  capabilityNotes?: string;
}

export interface PreviewMediaItem {
  id?: string;
  url: string;
  type: "image" | "video" | "IMAGE" | "VIDEO";
  name?: string;
  size?: number;
}

interface FacebookPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  location?: string | null;
  linkData?: { url: string; title: string; description: string; domain: string } | null;
  firstComment?: string | null;
}

export function FacebookPostPreview({
  account,
  content,
  media,
  location,
  linkData,
  firstComment,
}: FacebookPostPreviewProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const displayName = account.displayName || "Connected Facebook Page";
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
      {/* Header */}
      <div className="p-3.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white leading-tight">
                {displayName}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Just now</span>
              <span>·</span>
              <Globe className="w-3 h-3 text-slate-400" />
              {location && (
                <>
                  <span>·</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">📍 {location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600 p-1" title="More options">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Caption Content */}
      {content.trim() ? (
        <div className="px-3.5 pb-2.5 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-[12.5px]">
          {content}
        </div>
      ) : (
        <div className="px-3.5 pb-2.5 text-slate-400 italic text-[11px]">
          Write a caption in the composer...
        </div>
      )}

      {/* Media Display */}
      {media.length > 0 && (
        <div className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {media[activeMediaIndex]?.type === "video" ? (
            <video
              src={media[activeMediaIndex].url}
              controls
              playsInline
              className="w-full max-h-[340px] object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-72">
              <Image
                src={media[activeMediaIndex].url}
                alt="Facebook media"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Multiple Media Carousel Navigation */}
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                title="Previous media"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                title="Next media"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold">
                {activeMediaIndex + 1} / {media.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Link Card Attachment */}
      {linkData && !media.length && (
        <a
          href={linkData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition p-3"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            {linkData.domain}
          </span>
          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mt-0.5 text-xs">
            {linkData.title}
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{linkData.description}</p>
        </a>
      )}

      {/* Social Engagement Visual Counter (Zeroed / Realistic) */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
            👍
          </span>
          <span>Publishing preview</span>
        </div>
        <div className="flex items-center gap-2">
          <span>0 comments</span>
          <span>·</span>
          <span>0 shares</span>
        </div>
      </div>

      {/* Action Buttons Toolbar (Section 4: Disabled from fake interaction) */}
      <div className="px-2 py-1.5 flex items-center justify-around text-slate-500 dark:text-slate-400 font-semibold text-xs border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          disabled
          className="flex-1 py-1.5 flex items-center justify-center gap-1.5 opacity-70 cursor-not-allowed"
          title="Not supported by this integration"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button
          type="button"
          disabled
          className="flex-1 py-1.5 flex items-center justify-center gap-1.5 opacity-70 cursor-not-allowed"
          title="Not supported by this integration"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button
          type="button"
          disabled
          className="flex-1 py-1.5 flex items-center justify-center gap-1.5 opacity-70 cursor-not-allowed"
          title="Not supported by this integration"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* First Comment Preview if attached */}
      {firstComment && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
              {displayName}
            </span>
            <p className="text-[11px] text-slate-700 dark:text-slate-300">{firstComment}</p>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5 block">
              Automated 1st Comment on Publish
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
