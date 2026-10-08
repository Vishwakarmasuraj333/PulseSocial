"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Smile,
} from "lucide-react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";

interface InstagramPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  location?: string | null;
  firstComment?: string | null;
}

export function InstagramPostPreview({
  account,
  content,
  media,
  location,
  firstComment,
}: InstagramPostPreviewProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const username =
    account.username ||
    (account.displayName ? account.displayName.toLowerCase().replace(/[^a-z0-9_.]/g, "") : "pulsesocial_user");
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
      {/* Instagram Header */}
      <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100">
              <Image src={avatarUrl} alt={username} fill className="object-cover" unoptimized />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-white leading-tight">
                {username}
              </span>
              <span className="w-3 h-3 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold">
                ✓
              </span>
            </div>
            {location && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {location}
              </p>
            )}
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600 p-1" title="Options">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Media Canvas */}
      <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
        {media.length > 0 ? (
          media[activeMediaIndex]?.type === "video" ? (
            <video
              src={media[activeMediaIndex].url}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={media[activeMediaIndex].url}
                alt="Instagram post"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center bg-slate-900/50">
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-2">
              <span className="text-xl">📷</span>
            </div>
            <p className="text-[11px] text-slate-400">Attach an image or reel video in the composer</p>
          </div>
        )}

        {/* Carousel indicator & Navigation */}
        {media.length > 1 && (
          <>
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold backdrop-blur-sm">
              {activeMediaIndex + 1}/{media.length}
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              title="Previous image"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              title="Next image"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {media.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeMediaIndex ? "bg-blue-500 scale-125" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Instagram Action Icons (Section 4: Disabled from fake interaction) */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            disabled
            className="cursor-not-allowed opacity-75"
            title="Not supported by this integration"
          >
            <Heart className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed opacity-75"
            title="Not supported by this integration"
          >
            <MessageCircle className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed opacity-75"
            title="Not supported by this integration"
          >
            <Send className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
        <button
          type="button"
          disabled
          className="cursor-not-allowed opacity-75"
          title="Not supported by this integration"
        >
          <Bookmark className="w-5 h-5 stroke-[1.75]" />
        </button>
      </div>

      {/* Likes line */}
      <div className="px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>0 likes · Real interactions sync after publishing</span>
      </div>

      {/* Caption Content */}
      <div className="px-3 py-1.5 text-[12px] leading-relaxed text-slate-800 dark:text-slate-200">
        <span className="font-bold text-slate-900 dark:text-white mr-1.5">{username}</span>
        {content.trim() ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <span className="text-slate-400 italic">Caption preview will appear here...</span>
        )}
      </div>

      {/* First comment preview if attached */}
      {firstComment && (
        <div className="px-3 py-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
          <span className="font-bold text-slate-900 dark:text-white shrink-0">{username}</span>
          <span className="truncate">{firstComment}</span>
          <span className="ml-auto text-[9px] text-purple-600 dark:text-purple-400 font-bold shrink-0">
            1st Comment
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="px-3 pb-2.5 pt-1 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
        Just now
      </div>
    </div>
  );
}
