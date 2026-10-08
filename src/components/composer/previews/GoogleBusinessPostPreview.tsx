"use client";

import React from "react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";
import { MapPin, Globe, ExternalLink, PhoneCall, CheckCircle } from "lucide-react";

interface GoogleBusinessPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
  ctaType?: "LEARN_MORE" | "CALL_NOW" | "VISIT_SITE" | "BOOK";
  ctaUrl?: string;
}

export function GoogleBusinessPostPreview({
  account,
  content,
  media,
  ctaType = "LEARN_MORE",
  ctaUrl,
}: GoogleBusinessPostPreviewProps) {
  const heroImage = media.find((m) => m.type.toUpperCase() === "IMAGE")?.url || media[0]?.url;

  const getCtaLabel = () => {
    switch (ctaType) {
      case "CALL_NOW":
        return "Call Now";
      case "VISIT_SITE":
        return "Visit Website";
      case "BOOK":
        return "Book Online";
      default:
        return "Learn More";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white transition-all">
      {/* Google Header */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {account.profileImageUrl ? (
            <img
              src={account.profileImageUrl}
              alt={account.displayName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-blue-500/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {account.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                {account.displayName}
              </p>
              <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> Verified Business Update
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
          Google Search & Maps
        </span>
      </div>

      {/* Media */}
      {heroImage && (
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <img src={heroImage} alt="Business Media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
          {content || "Share your latest news, promotions, or business updates with customers on Google..."}
        </p>

        {/* CTA Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            {ctaType === "CALL_NOW" ? (
              <PhoneCall className="w-3.5 h-3.5" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            <span>{getCtaLabel()}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center italic">
          Displayed across Google Maps and Knowledge Panel upon publish
        </p>
      </div>
    </div>
  );
}
