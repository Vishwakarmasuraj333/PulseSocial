"use client";

import React from "react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";

interface ThreadsPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
}

export function ThreadsPostPreview({ account, content, media }: ThreadsPostPreviewProps) {
  const heroMedia = media[0];

  return (
    <div className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-zinc-100 transition-all p-4">
      <div className="flex items-start gap-3">
        {/* Left column: Avatar & Thread Line */}
        <div className="flex flex-col items-center">
          {account.profileImageUrl ? (
            <img
              src={account.profileImageUrl}
              alt={account.displayName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center">
              {account.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="w-0.5 flex-1 min-h-[40px] bg-slate-200 dark:bg-zinc-800 my-2 rounded-full" />
        </div>

        {/* Right column: Post Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold truncate text-slate-900 dark:text-zinc-100">
                {account.username || account.displayName.toLowerCase().replace(/\s+/g, "_")}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">· now</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          </div>

          {/* Text */}
          <div className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-zinc-200">
            {content || "Start a thread..."}
          </div>

          {/* Media */}
          {heroMedia && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 aspect-video w-full mt-2">
              {heroMedia.type.toUpperCase() === "VIDEO" ? (
                <video src={heroMedia.url} className="w-full h-full object-cover" controls={false} />
              ) : (
                <img src={heroMedia.url} alt="Attached visual" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          {/* Actions (Section 4: Disabled from fake interaction) */}
          <div className="flex items-center gap-4 pt-1 text-slate-400 dark:text-zinc-500">
            <button
              type="button"
              disabled
              className="cursor-not-allowed opacity-75"
              title="Not supported by this integration"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed opacity-75"
              title="Not supported by this integration"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed opacity-75"
              title="Not supported by this integration"
            >
              <Repeat2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed opacity-75"
              title="Not supported by this integration"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Engagement info */}
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 pt-1">
            Real engagements sync from Threads after publishing
          </p>
        </div>
      </div>
    </div>
  );
}
