"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  Share,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";

interface XPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  location?: string | null;
}

const X_CHARACTER_LIMIT = 280;

export function XPostPreview({ account, content, media, location }: XPostPreviewProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const displayName = account.displayName || "PulseSocial User";
  const rawUsername = account.username || displayName.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const username = rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`;
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";

  const charCount = content.length;
  const isOverLimit = charCount > X_CHARACTER_LIMIT;
  const remaining = X_CHARACTER_LIMIT - charCount;

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
      <div className="p-3.5 flex items-start gap-3">
        {/* Left: Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
          <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
        </div>

        {/* Right: Tweet Body */}
        <div className="flex-1 min-w-0">
          {/* Tweet Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-normal truncate">
                {username}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400 shrink-0">Just now</span>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Location if present */}
          {location && (
            <div className="text-[10px] text-sky-500 font-medium mt-0.5">
              📍 {location}
            </div>
          )}

          {/* Tweet Content */}
          <div className="mt-1.5 text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-[12.5px]">
            {content.trim() ? (
              <span>
                {isOverLimit ? (
                  <>
                    <span>{content.slice(0, X_CHARACTER_LIMIT)}</span>
                    <span className="bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded px-0.5">
                      {content.slice(X_CHARACTER_LIMIT)}
                    </span>
                  </>
                ) : (
                  content
                )}
              </span>
            ) : (
              <span className="text-slate-400 italic text-[11px]">What is happening?!</span>
            )}
          </div>

          {/* Media Attachment */}
          {media.length > 0 && (
            <div className="relative mt-2.5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
              {media[activeMediaIndex]?.type === "video" ? (
                <video
                  src={media[activeMediaIndex].url}
                  controls
                  playsInline
                  className="w-full max-h-[300px] object-contain bg-black"
                />
              ) : (
                <div className="relative w-full h-64">
                  <Image
                    src={media[activeMediaIndex].url}
                    alt="X Media"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Carousel navigation if multiple */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold">
                    {activeMediaIndex + 1}/{media.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Character Limit Warning Banner */}
          {isOverLimit && (
            <div className="mt-2 flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-semibold border border-rose-200 dark:border-rose-900/60">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Tweet exceeds X limit by {Math.abs(remaining)} characters. Shorten caption or split into a thread.</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="mt-3 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-sky-500 transition group"
              title="Reply"
            >
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">0</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-emerald-500 transition group"
              title="Repost"
            >
              <Repeat2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">0</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-rose-500 transition group"
              title="Like"
            >
              <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">0</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-sky-500 transition group"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-sky-500 transition group"
              title="Share"
            >
              <Share className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Character meter */}
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className={isOverLimit ? "text-rose-500" : remaining < 20 ? "text-amber-500" : "text-slate-400"}>
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
