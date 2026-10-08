"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";
import { Globe, Bookmark, ExternalLink } from "lucide-react";

interface PinterestPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  destinationUrl?: string | null;
  boardName?: string | null;
  pinTitle?: string;
}

export function PinterestPostPreview({
  account,
  content,
  media,
  destinationUrl,
  boardName = "Official Collection",
  pinTitle,
}: PinterestPostPreviewProps) {
  const [isSaved, setIsSaved] = useState(false);

  const heroImage = media.find((m) => m.type.toUpperCase() === "IMAGE")?.url || media[0]?.url;
  const displayTitle = pinTitle || content.slice(0, 50) || "Creative Pin";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white transition-all">
      {/* Media Image (Pinterest 2:3 vertical or aspect-square) */}
      <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden group">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Pinterest Pin"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-red-500/10">
            <span className="text-3xl mb-2">📌</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Upload an image to preview Pin
            </p>
          </div>
        )}

        {/* Pin Hover/Top Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white tracking-wide">
            {boardName}
          </span>
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`px-4 py-2 rounded-full font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer ${
              isSaved
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-[#E60023] hover:bg-[#ad081b] text-white"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        {destinationUrl && (
          <div className="absolute bottom-3 left-3">
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-slate-900 dark:text-white shadow hover:opacity-90"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{destinationUrl.replace(/^https?:\/\//, "")}</span>
            </a>
          </div>
        )}
      </div>

      {/* Pin Details */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {displayTitle}
          </h4>
          {content && content !== displayTitle && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
              {content}
            </p>
          )}
        </div>

        {/* Creator / Account row */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {account.profileImageUrl ? (
            <img
              src={account.profileImageUrl}
              alt={account.displayName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#E60023] text-white font-bold text-[11px] flex items-center justify-center">
              {account.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
              {account.displayName}
            </p>
            <p className="text-[10px] text-slate-400">
              {account.username ? `@${account.username}` : "Pinterest Creator"}
            </p>
          </div>
        </div>

        {/* Notice */}
        <p className="text-[10px] text-slate-400 text-center italic pt-1">
          Save action preview · Real stats sync after publishing
        </p>
      </div>
    </div>
  );
}
