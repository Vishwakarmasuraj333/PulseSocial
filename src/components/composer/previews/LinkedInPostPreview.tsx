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
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  Heart,
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

  // Truthful identity resolution:
  // Use connected identity if authorized; otherwise active workspace brand; never hardcoded universal names
  const displayName = account.displayName || account.username || "PulseSocial Workspace";
  const avatarUrl = account.profileImageUrl || "/icons/pulse-logo.svg";
  const headline = account.accountType || (account.isRealConnected ? "Authorized LinkedIn Channel" : "PulseSocial Workspace Channel");
  const isConnected = Boolean(account.isRealConnected && account.tokenStatus !== "EXPIRED");

  const LINKEDIN_MAX_CHARS = 3000;
  const isOverLimit = content.length > LINKEDIN_MAX_CHARS;
  const charPercentage = Math.min(100, Math.round((content.length / LINKEDIN_MAX_CHARS) * 100));

  // Helper to format hashtags & mentions in LinkedIn blue
  const renderFormattedContent = (text: string) => {
    if (!text.trim()) return null;

    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span key={index} className="text-[#0a66c2] dark:text-[#70b5f9] font-medium hover:underline">
            {part}
          </span>
        );
      }
      if (part.startsWith("@") && part.length > 1) {
        return (
          <span key={index} className="text-[#0a66c2] dark:text-[#70b5f9] font-medium hover:underline">
            {part}
          </span>
        );
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <span key={index} className="text-[#0a66c2] dark:text-[#70b5f9] underline break-all">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs font-sans transition-all">
      {/* ============================================================ */}
      {/* 1. TRUTHFUL SIMULATION vs LIVE STATUS BANNER                 */}
      {/* ============================================================ */}
      <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LinkedIn OAuth Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Publishing Preview Simulation</span>
            </span>
          )}
        </div>

        {/* Live Character Limit Counter */}
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-medium ${isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"}`}>
            {content.length}/{LINKEDIN_MAX_CHARS}
          </span>
          {isOverLimit && (
            <span className="text-[10px] text-rose-500 font-semibold">
              Exceeds Cap
            </span>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. LINKEDIN FEED HEADER                                      */}
      {/* ============================================================ */}
      <div className="p-3.5 sm:p-4 flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white leading-tight truncate text-sm">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                &bull; 1st
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
              {headline}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
              <span>Just now</span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-0.5" title="Visible to Anyone on LinkedIn">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>Public</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1 text-[#0a66c2] dark:text-[#70b5f9] font-bold px-2.5 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Post actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CAPTION CONTENT                                           */}
      {/* ============================================================ */}
      <div className="px-3.5 sm:px-4 pb-3">
        {content.trim() ? (
          <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-[13px] break-words">
            {renderFormattedContent(content)}
          </div>
        ) : (
          <div className="text-slate-400 italic text-[12px] py-1">
            Share your professional insights, industry updates, or company news...
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. ATTACHED CREATIVE MEDIA VISUALS                           */}
      {/* ============================================================ */}
      {media.length > 0 && (
        <div className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden border-t border-b border-slate-100 dark:border-slate-800">
          {media[activeMediaIndex]?.type === "video" ? (
            <video
              src={media[activeMediaIndex].url}
              controls
              playsInline
              className="w-full max-h-[340px] object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-80">
              <Image
                src={media[activeMediaIndex].url}
                alt={media[activeMediaIndex].altText || "LinkedIn media preview"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Carousel controls for multi-media */}
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                }
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition shadow-md"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition shadow-md"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold">
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
          className="block border-t border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition p-3"
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

      {/* ============================================================ */}
      {/* 5. TRUTHFUL ENGAGEMENT & REACTION BAR                        */}
      {/* ============================================================ */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[9px] shadow-2xs">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] shadow-2xs">
              👏
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-2xs">
              💡
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-[10.5px]">
            Publishing Preview
          </span>
        </div>
        <div className="text-[10.5px] text-slate-400">
          <span>0 comments &bull; 0 reposts</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. LINKEDIN ACTION BUTTONS (Authentic Visual Styling)        */}
      {/* ============================================================ */}
      <div className="px-2 py-1 flex items-center justify-around text-slate-600 dark:text-slate-300 font-semibold text-xs border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          disabled
          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Interactive reactions are enabled on live LinkedIn post once published"
        >
          <ThumbsUp className="w-4 h-4 text-slate-500" />
          <span>Like</span>
        </button>
        <button
          type="button"
          disabled
          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Comments will sync via Social Inbox once published"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Comment</span>
        </button>
        <button
          type="button"
          disabled
          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Reposts are tracked via Analytics once broadcasted"
        >
          <Repeat2 className="w-4 h-4 text-slate-500" />
          <span>Repost</span>
        </button>
        <button
          type="button"
          disabled
          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Direct send available on LinkedIn"
        >
          <Send className="w-4 h-4 text-slate-500" />
          <span>Send</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 7. FIRST COMMENT PREVIEW                                     */}
      {/* ============================================================ */}
      {firstComment && (
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300 dark:border-slate-700">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-bold text-[11px] text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800">
                Author &bull; Auto First Comment
              </span>
            </div>
            <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {firstComment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkedInPostPreview;
