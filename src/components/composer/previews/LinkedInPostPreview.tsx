"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";

interface LinkedInPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  linkData?: { url: string; title: string; description: string; domain: string } | null;
  firstComment?: string | null;
}

export function LinkedInPostPreview({
  account,
  content,
  media,
  linkData,
  firstComment,
}: LinkedInPostPreviewProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const displayName = account.displayName || "Connected LinkedIn Page";
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";
  const headline = account.accountType || "Official LinkedIn Channel";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
      {/* LinkedIn Header */}
      <div className="p-3.5 flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">· 1st</span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
              {headline}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <span>Just now</span>
              <span>·</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px]"
          >
            <Plus className="w-3 h-3" /> Follow
          </button>
          <button type="button" className="text-slate-400 hover:text-slate-600 p-1" title="More">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caption Content */}
      {content.trim() ? (
        <div className="px-3.5 pb-2.5 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-[12px]">
          {content}
        </div>
      ) : (
        <div className="px-3.5 pb-2.5 text-slate-400 italic text-[11px]">
          Share your professional insights or updates...
        </div>
      )}

      {/* Media Box */}
      {media.length > 0 && (
        <div className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden border-t border-b border-slate-100 dark:border-slate-800">
          {media[activeMediaIndex]?.type === "video" ? (
            <video
              src={media[activeMediaIndex].url}
              controls
              playsInline
              className="w-full max-h-[320px] object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-72">
              <Image
                src={media[activeMediaIndex].url}
                alt="LinkedIn media"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                {activeMediaIndex + 1} of {media.length}
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
          className="block border-t border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 p-3"
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

      {/* Engagement Counter */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
            👍
          </span>
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] -ml-1.5">
            👏
          </span>
          <span className="ml-1">Publishing preview</span>
        </div>
        <div className="flex items-center gap-2">
          <span>0 comments</span>
          <span>·</span>
          <span>0 reposts</span>
        </div>
      </div>

      {/* LinkedIn Toolbar */}
      <div className="px-2 py-1 flex items-center justify-around text-slate-600 dark:text-slate-300 font-semibold text-xs">
        <button
          type="button"
          className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button
          type="button"
          className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button
          type="button"
          className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
        >
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>
        <button
          type="button"
          className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>

      {/* First comment preview */}
      {firstComment && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
          <div className="relative w-6 h-6 rounded-md overflow-hidden bg-slate-200 shrink-0">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
              {displayName}
            </span>
            <p className="text-[11px] text-slate-700 dark:text-slate-300">{firstComment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
