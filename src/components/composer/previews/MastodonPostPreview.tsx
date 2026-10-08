"use client";

import React, { useState } from "react";
import { PreviewAccount, PreviewMediaItem } from "./FacebookPostPreview";
import { MessageSquare, Repeat, Star, Bookmark, Share2, MoreHorizontal } from "lucide-react";

interface MastodonPostPreviewProps {
  account: PreviewAccount;
  content: string;
  media: PreviewMediaItem[];
}

export function MastodonPostPreview({ account, content, media }: MastodonPostPreviewProps) {
  const [isBoosted, setIsBoosted] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const heroMedia = media[0];
  const instanceHandle = account.username?.includes("@")
    ? `@${account.username}`
    : `@${account.username || "creator"}@mastodon.social`;

  return (
    <div className="bg-[#282c37] rounded-2xl border border-[#393f4f] shadow-xl overflow-hidden max-w-sm mx-auto text-white transition-all p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {account.profileImageUrl ? (
            <img
              src={account.profileImageUrl}
              alt={account.displayName}
              className="w-9 h-9 rounded-md object-cover ring-1 ring-[#6364ff]/40"
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-[#6364ff] text-white font-bold text-xs flex items-center justify-center">
              {account.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-white leading-tight">
              {account.displayName}
            </p>
            <p className="text-[11px] text-[#9baec8] truncate">{instanceHandle}</p>
          </div>
        </div>

        <span className="text-[11px] text-[#9baec8]">now</span>
      </div>

      {/* Post Text */}
      <div className="text-xs leading-relaxed whitespace-pre-wrap text-[#d9e1e8]">
        {content || "What is on your mind?"}
      </div>

      {/* Media */}
      {heroMedia && (
        <div className="rounded-xl overflow-hidden border border-[#393f4f] bg-[#1f232b] aspect-video w-full mt-2">
          {heroMedia.type.toUpperCase() === "VIDEO" ? (
            <video src={heroMedia.url} className="w-full h-full object-cover" controls={false} />
          ) : (
            <img src={heroMedia.url} alt="Attached Media" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#393f4f] text-[#9baec8]">
        <button
          type="button"
          className="p-1.5 hover:text-white hover:bg-[#313543] rounded-lg transition cursor-pointer"
          title="Reply"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsBoosted(!isBoosted)}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            isBoosted ? "text-[#6364ff]" : "hover:text-[#6364ff] hover:bg-[#313543]"
          }`}
          title="Boost"
        >
          <Repeat className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsFavourited(!isFavourited)}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            isFavourited ? "text-amber-400 fill-amber-400" : "hover:text-amber-400 hover:bg-[#313543]"
          }`}
          title="Favourite"
        >
          <Star className={`w-4 h-4 ${isFavourited ? "fill-amber-400" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            isBookmarked ? "text-rose-400" : "hover:text-rose-400 hover:bg-[#313543]"
          }`}
          title="Bookmark"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="p-1.5 hover:text-white hover:bg-[#313543] rounded-lg transition cursor-pointer"
          title="More"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-[#9baec8] text-center italic">
        Fediverse federated broadcast upon publishing
      </p>
    </div>
  );
}
