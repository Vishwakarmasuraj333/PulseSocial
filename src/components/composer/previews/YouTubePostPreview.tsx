"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Bell,
  Play,
  Flame,
} from "lucide-react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";

interface YouTubePostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  title?: string;
  isShorts?: boolean;
}

export function YouTubePostPreview({
  account,
  content,
  media,
  title,
  isShorts = false,
}: YouTubePostPreviewProps) {
  const channelName = account.displayName || "PulseSocial Channel";
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";

  const videoItem = media.find((m) => m.type === "video") || media[0];

  // Derive video title from explicit title or first line of content
  const videoTitle =
    title?.trim() ||
    content.split("\n")[0]?.trim() ||
    "Untitled Video - Publishing Preview";

  const description = content.split("\n").slice(1).join("\n").trim() || content;

  if (isShorts) {
    return (
      <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] max-h-[520px] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between text-white select-none">
        {/* Shorts Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold">
          <Flame className="w-3 h-3" />
          <span>Shorts</span>
        </div>

        {/* Video / Thumbnail Canvas */}
        <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
          {videoItem ? (
            videoItem.type === "video" ? (
              <video
                src={videoItem.url}
                controls={false}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={videoItem.url}
                  alt="YouTube Shorts"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )
          ) : (
            <div className="text-center p-6 text-slate-500">
              <Play className="w-10 h-10 mx-auto text-red-500 mb-2" />
              <p className="text-xs text-slate-400">Attach vertical video in composer</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Bottom Details Overlay */}
        <div className="relative z-10 p-3.5 mt-auto flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Channel info with Subscribe */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                <Image src={avatarUrl} alt={channelName} fill className="object-cover" unoptimized />
              </div>
              <span className="font-bold text-xs truncate">{channelName}</span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs font-semibold line-clamp-2 leading-snug drop-shadow">
              {videoTitle}
            </p>
          </div>

          {/* Right Rail Icons */}
          <div className="flex flex-col items-center gap-3 shrink-0 pb-1">
            <button type="button" className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold">0</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
                <ThumbsDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold">Dislike</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold">Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
      {/* 16:9 Video Player / Thumbnail */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
        {videoItem ? (
          videoItem.type === "video" ? (
            <video
              src={videoItem.url}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={videoItem.url}
                alt={videoTitle}
                fill
                className="object-contain"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
            <p className="text-xs text-slate-400">Attach video or thumbnail</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-semibold">
          Preview
        </div>
      </div>

      {/* Video Title */}
      <div className="p-3">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">
          {videoTitle}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          <span>0 views</span>
          <span>·</span>
          <span>Just now</span>
        </div>

        {/* Channel Row & Subscribe */}
        <div className="mt-3 flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
              <Image src={avatarUrl} alt={channelName} fill className="object-cover" unoptimized />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                {channelName}
              </span>
              <span className="text-[10px] text-slate-400">0 subscribers</span>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Subscribe</span>
          </button>
        </div>

        {/* Video Actions Toolbar */}
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
          <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              className="px-2.5 py-1 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-full transition"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>0</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700" />
            <button
              type="button"
              className="px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-full transition"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>

        {/* Description Snippet Box */}
        {description && (
          <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300">
            <p className="line-clamp-2">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
