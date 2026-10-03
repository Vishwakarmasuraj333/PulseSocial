"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { GeminiAiModal } from "@/components/composer/GeminiAiModal";
import {
  Send,
  Calendar,
  Clock,
  Image as ImageIcon,
  Smile,
  Hash,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  UploadCloud,
  X,
  Loader2,
  Globe,
  Repeat2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Plus,
} from "lucide-react";

interface SocialAccount {
  id: string;
  provider: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  isRealConnected?: boolean;
}

const DEFAULT_WORKSPACE_CHANNELS: SocialAccount[] = [
  { id: "ch-linkedin", provider: "linkedin", displayName: "LinkedIn", username: "company", profileImageUrl: null },
  { id: "ch-x", provider: "x", displayName: "X (Twitter)", username: "brand_official", profileImageUrl: null },
  { id: "ch-instagram", provider: "instagram", displayName: "Instagram", username: "brand_official", profileImageUrl: null },
  { id: "ch-facebook", provider: "facebook", displayName: "Facebook Page", username: "brand_page", profileImageUrl: null },
  { id: "ch-youtube", provider: "youtube", displayName: "YouTube", username: "brand_channel", profileImageUrl: null },
  { id: "ch-pinterest", provider: "pinterest", displayName: "Pinterest", username: "brand_pins", profileImageUrl: null },
  { id: "ch-threads", provider: "threads", displayName: "Threads", username: "brand_threads", profileImageUrl: null },
];

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  youtube: 5000,
  tiktok: 2200,
  pinterest: 500,
  threads: 500,
};

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [content, setContent] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(["ch-linkedin", "ch-x"]);
  const [accounts, setAccounts] = useState<SocialAccount[]>(DEFAULT_WORKSPACE_CHANNELS);
  const [previewPlatform, setPreviewPlatform] = useState<string>("instagram");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Media
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scheduling
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isPublishing, setIsPublishing] = useState(false);

  // Interactive like on preview
  const [isLikedPreview, setIsLikedPreview] = useState(false);

  // Load connected accounts from backend
  useEffect(() => {
    fetch("/api/social/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const liveAccs: SocialAccount[] = [];
        (data?.providers || []).forEach((p: any) => {
          if (p.isConnected && p.connectedAccount) {
            liveAccs.push({
              id: p.connectedAccount.id,
              provider: p.platform,
              displayName: p.connectedAccount.displayName || p.displayName,
              username: p.connectedAccount.username,
              profileImageUrl: p.connectedAccount.profileImageUrl,
              isRealConnected: true,
            });
          }
        });

        if (liveAccs.length > 0) {
          // Merge live accounts with default workspace channels so user always has full fleet
          const combined = [
            ...liveAccs,
            ...DEFAULT_WORKSPACE_CHANNELS.filter(
              (def) => !liveAccs.some((l) => l.provider === def.provider)
            ),
          ];
          setAccounts(combined);
          setSelectedAccountIds(liveAccs.map((a) => a.id));
          setPreviewPlatform(liveAccs[0].provider);
        } else {
          setAccounts(DEFAULT_WORKSPACE_CHANNELS);
        }
      })
      .catch(() => {
        setAccounts(DEFAULT_WORKSPACE_CHANNELS);
      });
  }, []);

  const toggleAccount = (id: string, provider: string) => {
    setSelectedAccountIds((prev) => {
      const isAlreadySelected = prev.includes(id);
      if (isAlreadySelected) {
        return prev.filter((item) => item !== id);
      } else {
        setPreviewPlatform(provider);
        return [...prev, id];
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMediaUrl(data.url);
      toast({
        title: "Media Attached",
        message: "Creative visual uploaded successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Upload Failed",
        message: (err as Error).message || "Could not upload file.",
        type: "error",
      });
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAction = async (action: "DRAFT" | "SCHEDULE" | "PUBLISH_NOW") => {
    if (!content.trim() && !mediaUrl) {
      toast({ title: "Content Required", message: "Please enter your message or attach media.", type: "warning" });
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast({ title: "Select Channel", message: "Please select at least one social channel.", type: "warning" });
      return;
    }

    setIsPublishing(true);

    try {
      let scheduledFor: string | undefined = undefined;
      if (action === "SCHEDULE" && scheduledDate) {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime || "12:00"}:00Z`).toISOString();
      }

      // Filter real account IDs or pass fallback
      const realTargetIds = selectedAccountIds.filter((id) => !id.startsWith("ch-"));

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetAccountIds: realTargetIds.length > 0 ? realTargetIds : ["default"],
          action,
          scheduledFor,
          mediaUrls: mediaUrl ? [{ url: mediaUrl, type: "IMAGE" }] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast action failed");

      toast({
        title: action === "PUBLISH_NOW" ? "Broadcast Live!" : "Post Saved!",
        message:
          action === "PUBLISH_NOW"
            ? "Your post is now live across your selected networks."
            : "Post saved to your publishing queue.",
        type: "success",
      });

      router.push("/calendar");
    } catch (err: unknown) {
      toast({ title: "Publish Error", message: (err as Error).message, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentLimit = PLATFORM_LIMITS[previewPlatform] || 2200;
  const isOverLimit = content.length > currentLimit;

  // Active channel details for preview
  const activeAccount = accounts.find((a) => a.provider === previewPlatform);
  const brandDisplayName = activeAccount?.displayName || activeBrand?.name || "PulseSocial Workspace";
  const brandAvatar = activeAccount?.profileImageUrl || activeBrand?.avatarUrl || "";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Studio Post Composer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simultaneous multi-network broadcast with real-time native preview simulator.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => handleAction("DRAFT")}
              className="text-xs font-semibold rounded-xl"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleAction("PUBLISH_NOW")}
              isLoading={isPublishing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Publish Now
            </Button>
          </div>
        </div>

        {/* 2-Column Composer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Target Channels & Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Channel Targeting Selector */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Broadcast Channels ({selectedAccountIds.length} Selected)
                </span>
                <Link
                  href="/connections"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Connect New Channel
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountIds.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id, acc.provider)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 opacity-60 hover:opacity-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {renderPlatformIcon(acc.provider, 16)}
                      <span>{acc.displayName}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-0.5" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Editor Area */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share across your channels? Craft your message, paste links, or use AI Assistant..."
                className="w-full text-sm bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white leading-relaxed"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev} #Growth #Innovation #Trending `)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    title="Insert Hashtags"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev} 🚀✨ `)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-pointer transition border border-indigo-200/60 dark:border-indigo-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Assistant
                  </button>
                </div>

                {/* Character Counter */}
                <div className="text-xs font-semibold">
                  <span className={isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"}>
                    {content.length}
                  </span>
                  <span className="text-slate-400"> / {currentLimit} ({previewPlatform.toUpperCase()})</span>
                </div>
              </div>
            </div>

            {/* Media Attachment Section */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" /> Attached Creative Visuals
                </label>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="text-xs font-medium text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Visual
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {isUploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{isUploadingMedia ? "Uploading..." : "Upload Media"}</span>
                </button>
                <span className="text-xs text-slate-400 hidden sm:inline">or</span>
                <Input
                  type="url"
                  placeholder="Paste direct image or video URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1 rounded-xl text-xs"
                />
              </div>

              {mediaUrl && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mt-2 shadow-xs">
                  <img src={mediaUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Scheduling Section */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Schedule for Later
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              {scheduledDate && (
                <Button
                  onClick={() => handleAction("SCHEDULE")}
                  isLoading={isPublishing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Schedule for {scheduledDate} at {scheduledTime}
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT: Live Native Preview Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Native Preview
              </span>

              {/* Switch Preview Channel */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {["instagram", "facebook", "linkedin", "x", "youtube", "pinterest"].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setPreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewPlatform === plat
                        ? "bg-white dark:bg-slate-900 shadow-xs text-indigo-600"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    title={plat.toUpperCase()}
                  >
                    {renderPlatformIcon(plat, 16)}
                  </button>
                ))}
              </div>
            </div>

            {/* INSTAGRAM NATIVE CARD SIMULATOR */}
            {previewPlatform === "instagram" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white">
                <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {brandAvatar ? (
                      <div className="w-8 h-8 rounded-full ring-2 ring-pink-500/40 p-0.5 overflow-hidden">
                        <img src={brandAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-pink-500/30">
                        {brandDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold leading-tight">{brandDisplayName}</p>
                      <p className="text-[10px] text-slate-400">Direct Post</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">•••</span>
                </div>

                {mediaUrl ? (
                  <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 relative">
                    <img src={mediaUrl} alt="Post Visual" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center p-6 text-center border-y border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic line-clamp-3">
                      {content || "Craft your message in the composer to simulate your live post..."}
                    </p>
                  </div>
                )}

                <div className="p-3 pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart
                        onClick={() => setIsLikedPreview(!isLikedPreview)}
                        className={`w-5 h-5 cursor-pointer transition ${isLikedPreview ? "text-rose-500 fill-rose-500" : "text-slate-800 dark:text-slate-200"}`}
                      />
                      <MessageCircle className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                      <Send className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                    </div>
                    <Bookmark className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  </div>

                  <p className="text-xs font-bold">{isLikedPreview ? "1 like" : "0 likes"}</p>

                  <div className="text-xs leading-relaxed">
                    <span className="font-bold mr-1.5">{brandDisplayName}</span>
                    <span className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {content || "Your caption will appear here..."}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 uppercase tracking-wider pt-1">Just now</p>
                </div>
              </div>
            )}

            {/* FACEBOOK NATIVE CARD SIMULATOR */}
            {previewPlatform === "facebook" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                      {brandDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight flex items-center gap-1">
                        {brandDisplayName}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        Just now · <Globe className="w-2.5 h-2.5" />
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">•••</span>
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {content || "Your Facebook post update will appear here..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 aspect-video w-full bg-slate-100">
                    <img src={mediaUrl} alt="FB Media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">👍 ❤️ 42</span>
                  <span>6 comments · 2 shares</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <button className="py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Like
                  </button>
                  <button className="py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Comment
                  </button>
                  <button className="py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            )}

            {/* LINKEDIN NATIVE CARD SIMULATOR */}
            {previewPlatform === "linkedin" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs">
                      {brandDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{brandDisplayName}</p>
                      <p className="text-[10px] text-slate-400">Organization · 1,420 followers</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        Now · <Globe className="w-2.5 h-2.5" />
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">•••</span>
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {content || "Your professional LinkedIn update will appear here..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 aspect-video w-full bg-slate-100">
                    <img src={mediaUrl} alt="LinkedIn Media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">👏 💡 ❤️ 68</span>
                  <span>9 comments · 4 reposts</span>
                </div>

                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <button className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center justify-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Like
                  </button>
                  <button className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Comment
                  </button>
                  <button className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center justify-center gap-1">
                    <Repeat2 className="w-3 h-3" /> Repost
                  </button>
                  <button className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" /> Send
                  </button>
                </div>
              </div>
            )}

            {/* X / TWITTER NATIVE CARD SIMULATOR */}
            {previewPlatform === "x" && (
              <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                      {brandDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{brandDisplayName}</p>
                      <p className="text-[10px] text-slate-400">@brand_official · Just now</p>
                    </div>
                  </div>
                  {renderPlatformIcon("x", "w-4 h-4 text-slate-800 dark:text-white")}
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                  {content || "What is happening?! Craft your post to view real-time simulator..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 aspect-video w-full bg-slate-100 dark:bg-slate-900">
                    <img src={mediaUrl} alt="X media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs px-2">
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 8</span>
                  <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" /> 14</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 95</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 1.2K</span>
                  <Share2 className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* YOUTUBE COMMUNITY / SHORTS PREVIEW */}
            {previewPlatform === "youtube" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900 dark:text-white p-3 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center font-bold text-xs">
                    {brandDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{brandDisplayName}</p>
                    <p className="text-[10px] text-slate-400">Community Post · Just now</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {content || "Your YouTube community announcement will appear here..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden aspect-video w-full bg-slate-100">
                    <img src={mediaUrl} alt="YouTube Visual" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> 210</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /></span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 34</span>
                </div>
              </div>
            )}

            {/* PINTEREST PIN PREVIEW */}
            {previewPlatform === "pinterest" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-xs mx-auto text-slate-900 dark:text-white space-y-2">
                <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="Pin" className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs font-semibold text-slate-400">Attach an image to preview Pin</p>
                    </div>
                  )}
                  <button className="absolute top-3 right-3 bg-[#E60023] hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                    Save
                  </button>
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="text-xs font-bold truncate">{content ? content.slice(0, 40) : "Pin Title"}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {content || "Pin description and hashtags will appear here..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real Clean Gemini AI Assistant Modal */}
        <GeminiAiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          brandName={brandDisplayName}
          onApply={(data) => {
            setContent(data.caption);
            if (data.hashtags && data.hashtags.length > 0) {
              setContent((prev) => `${prev}\n\n${data.hashtags!.join(" ")}`);
            }
            toast({
              title: "AI Copy Applied!",
              message: "Generated content inserted into your post composer.",
              type: "success",
            });
          }}
        />
      </div>
    </AppLayout>
  );
}
