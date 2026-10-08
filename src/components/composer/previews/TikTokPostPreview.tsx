"use client";

import React from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Plus,
} from "lucide-react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";

interface TikTokPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
}

export function TikTokPostPreview({ account, content, media }: TikTokPostPreviewProps) {
  const displayName = account.displayName || "PulseSocial Creator";
  const rawUsername = account.username || displayName.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const username = rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`;
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";

  const videoItem = media.find((m) => m.type === "video") || media[0];

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] max-h-[520px] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between text-white select-none">
      {/* Background Media */}
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
                alt="TikTok preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-2">
              <span className="text-xl">🎵</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Attach vertical video or image</p>
          </div>
        )}
        {/* Subtle Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-3.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-white/60">Following</span>
        <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        <span className="text-white/60">LIVE</span>
      </div>

      {/* Main Content Overlay: Right Action Rail & Bottom Captions */}
      <div className="relative z-10 p-3 flex items-end justify-between gap-3">
        {/* Bottom Left: Creator info, caption, audio */}
        <div className="flex-1 min-w-0 pb-1">
          <h4 className="font-bold text-sm tracking-tight drop-shadow-md text-white">
            {username}
          </h4>
          <p className="mt-1 text-xs text-white/95 line-clamp-3 leading-snug drop-shadow whitespace-pre-wrap">
            {content.trim() ? content : "Add caption and hashtags in composer..."}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/90 drop-shadow">
            <Music className="w-3.5 h-3.5 shrink-0 animate-bounce" />
            <span className="truncate">Original Sound - {displayName}</span>
          </div>
        </div>

        {/* Right Rail: Action Icons */}
        <div className="flex flex-col items-center gap-3.5 pb-2 shrink-0">
          {/* Avatar with Follow Plus */}
          <div className="relative mb-1">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-slate-800">
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
              <Plus className="w-3 h-3" />
            </div>
          </div>

          {/* Heart / Like */}
          <button type="button" className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <Heart className="w-5 h-5 fill-white/10 text-white" />
            </div>
            <span className="text-[10px] font-bold">0</span>
          </button>

          {/* Comment */}
          <button type="button" className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <MessageCircle className="w-5 h-5 fill-white/10 text-white" />
            </div>
            <span className="text-[10px] font-bold">0</span>
          </button>

          {/* Bookmark */}
          <button type="button" className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <Bookmark className="w-5 h-5 fill-white/10 text-white" />
            </div>
            <span className="text-[10px] font-bold">0</span>
          </button>

          {/* Share */}
          <button type="button" className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold">Share</span>
          </button>

          {/* Spinning Vinyl Disc */}
          <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center p-1.5 animate-spin">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image src={avatarUrl} alt="Music" fill className="object-cover" unoptimized />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
