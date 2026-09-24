"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface SocialAccount {
  id: string;
  provider: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
}

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  youtube: 5000,
  tiktok: 2200,
  pinterest: 500,
  google_business: 1500,
  mastodon: 500,
};

export default function PostComposerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewPlatform, setPreviewPlatform] = useState<string>("instagram");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetch("/api/social/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const accs: SocialAccount[] = [];
        (data?.providers || []).forEach((p: any) => {
          if (p.isConnected && p.connectedAccount) {
            accs.push({
              id: p.connectedAccount.id || p.platform,
              provider: p.platform,
              displayName: p.connectedAccount.displayName,
              username: p.connectedAccount.username,
              profileImageUrl: p.connectedAccount.profileImageUrl,
            });
          }
        });
        setAccounts(accs);
        setSelectedAccountIds(accs.map((a) => a.id));
      })
      .catch(() => {});
  }, []);

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        message: "Creative media uploaded successfully.",
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
      toast({ title: "Error", message: "Please enter post content or attach media", type: "error" });
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast({ title: "Error", message: "Select at least one social channel", type: "error" });
      return;
    }

    setIsPublishing(true);
    try {
      const scheduledFor =
        action === "SCHEDULE" && scheduledDate
          ? `${scheduledDate}T${scheduledTime || "12:00"}:00Z`
          : undefined;

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetAccountIds: selectedAccountIds,
          action,
          scheduledFor,
          mediaUrls: mediaUrl ? [{ url: mediaUrl, type: "IMAGE" }] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast action failed");

      toast({
        title: action === "PUBLISH_NOW" ? "Broadcast Live!" : "Post Scheduled!",
        message:
          action === "PUBLISH_NOW"
            ? "Post published across all selected networks."
            : "Post added to your calendar schedule.",
        type: "success",
      });

      router.push("/calendar");
    } catch (err: unknown) {
      toast({ title: "Failed", message: (err as Error).message, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentLimit = PLATFORM_LIMITS[previewPlatform] || 2200;
  const isOverLimit = content.length > currentLimit;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Studio Post Composer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-channel simultaneous authoring with real-time native preview simulator
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleAction("DRAFT")}
              className="text-xs font-semibold"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleAction("PUBLISH_NOW")}
              isLoading={isPublishing}
              className="bg-[#5846A8] hover:bg-[#48388d] text-white rounded-xl text-xs font-semibold px-6 shadow-md shadow-purple-900/20"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Publish Now
            </Button>
          </div>
        </div>

        {/* 2-Column Composer: Left = Editor, Right = Live Native Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Target Channels & Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Channel Targeting Selector */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Target Broadcast Channels ({selectedAccountIds.length} Selected)
              </span>

              <div className="flex items-center gap-2.5 flex-wrap">
                {accounts.length === 0 ? (
                  <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">No social channels connected to this workspace.</p>
                    <Link
                      href="/connections"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                    >
                      Connect a Channel
                    </Link>
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          toggleAccount(acc.id);
                          setPreviewPlatform(acc.provider);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? "border-[#5846A8] bg-[#f5f3ff] text-[#5846A8] ring-2 ring-[#5846A8]/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 opacity-60 hover:opacity-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {renderPlatformIcon(acc.provider, 16)}
                        <span>{acc.displayName}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5846A8]" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Text Editor Area */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share across your channels? Craft your message, add hashtags, or mention collaborators..."
                className="w-full text-sm bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev} #PulseSocial #Enterprise `)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#5846A8] hover:bg-[#f5f3ff] dark:hover:bg-slate-800 cursor-pointer transition"
                    title="Insert Hashtags"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev} 🚀✨ `)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#5846A8] hover:bg-[#f5f3ff] dark:hover:bg-slate-800 cursor-pointer transition"
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setContent((prev) =>
                        prev ? `${prev}\n\nKey Highlights:\n• Accelerated Multi-Channel Reach\n• Unified Publishing` : "Exciting milestone! We're expanding our multi-channel social fleet with real-time analytics."
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-[#5846A8] bg-[#f5f3ff] hover:bg-[#ede9fe] dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Polish
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
                  <ImageIcon className="w-4 h-4 text-[#5846A8]" /> Attached Creative Media
                </label>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="text-xs font-medium text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove Media
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
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#5846A8]/30 bg-[#f5f3ff] text-[#5846A8] hover:bg-[#ede9fe] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {isUploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{isUploadingMedia ? "Uploading..." : "Upload File"}</span>
                </button>
                <span className="text-xs text-slate-400 hidden sm:inline">or</span>
                <Input
                  type="url"
                  placeholder="Paste direct image or video URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1"
                />
              </div>

              {mediaUrl && (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mt-2">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Scheduling Section */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5846A8]" /> Schedule for Later
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>

              {scheduledDate && (
                <Button
                  onClick={() => handleAction("SCHEDULE")}
                  isLoading={isPublishing}
                  className="w-full bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold rounded-xl"
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
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
                {["instagram", "facebook", "linkedin", "x"].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setPreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewPlatform === plat
                        ? "bg-white dark:bg-slate-900 shadow-xs text-[#5846A8]"
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-sm mx-auto text-slate-900">
                {/* Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {accounts.find((a) => a.provider === previewPlatform)?.profileImageUrl ? (
                      <div className="w-8 h-8 rounded-full ring-2 ring-[#5846A8]/40 p-0.5 overflow-hidden">
                        <img
                          src={accounts.find((a) => a.provider === previewPlatform)!.profileImageUrl!}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#5846A8] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#5846A8]/30">
                        {(accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "P").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "Pulse Workspace"}
                      </p>
                      <p className="text-[10px] text-slate-400">Direct Post</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold">•••</span>
                </div>

                {/* Media Preview */}
                {mediaUrl && (
                  <div className="aspect-square w-full bg-slate-100 relative">
                    <img
                      src={mediaUrl}
                      alt="post media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Action Bar */}
                <div className="p-3 pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-slate-800" />
                      <MessageCircle className="w-5 h-5 text-slate-800" />
                      <Send className="w-5 h-5 text-slate-800" />
                    </div>
                    <Bookmark className="w-5 h-5 text-slate-800" />
                  </div>

                  <p className="text-xs font-bold">0 likes</p>

                  <div className="text-xs space-x-1.5">
                    <span className="font-bold">
                      {accounts.find((a) => a.provider === previewPlatform)?.username || accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "Pulse Workspace"}
                    </span>
                    <span className="text-slate-800 whitespace-pre-line">
                      {content || "Your caption will appear here..."}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 uppercase pt-1">Just now</p>
                </div>
              </div>
            )}

            {/* X / TWITTER NATIVE CARD SIMULATOR */}
            {previewPlatform === "x" && (
              <div className="bg-black text-white rounded-2xl p-4 shadow-xl max-w-sm mx-auto space-y-3 font-sans">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#5846A8] text-white flex items-center justify-center font-bold text-sm">
                    {accounts.find((a) => a.provider === previewPlatform)?.profileImageUrl ? (
                      <img
                        src={accounts.find((a) => a.provider === previewPlatform)!.profileImageUrl!}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "P").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">
                        {accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "PulseSocial Workspace"}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        @{accounts.find((a) => a.provider === previewPlatform)?.username || "pulsesocial"} · Just now
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">
                      {content || "What's happening? Write your tweet in composer..."}
                    </p>
                  </div>
                </div>

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 aspect-video relative">
                    <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-500 text-xs pt-1 px-4">
                  <div className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> 0</div>
                  <div className="flex items-center gap-1.5"><Share2 className="w-4 h-4" /> 0</div>
                  <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> 0</div>
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* LINKEDIN NATIVE CARD SIMULATOR */}
            {previewPlatform === "linkedin" && (
              <div className="bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xl max-w-sm mx-auto p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5846A8] text-white flex items-center justify-center font-bold text-sm">
                    {accounts.find((a) => a.provider === previewPlatform)?.profileImageUrl ? (
                      <img
                        src={accounts.find((a) => a.provider === previewPlatform)!.profileImageUrl!}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "P").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "PulseSocial Workspace"}
                    </p>
                    <p className="text-[10px] text-slate-500">Official Channel · Direct</p>
                    <p className="text-[10px] text-slate-400">Just now · 🌐</p>
                  </div>
                </div>

                <p className="text-xs text-slate-800 whitespace-pre-line">
                  {content || "Your professional LinkedIn share preview will render here..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-100 aspect-video relative">
                    <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <button className="flex items-center gap-1 hover:text-[#5846A8]">👍 Like</button>
                  <button className="flex items-center gap-1 hover:text-[#5846A8]">💬 Comment</button>
                  <button className="flex items-center gap-1 hover:text-[#5846A8]">🔁 Repost</button>
                  <button className="flex items-center gap-1 hover:text-[#5846A8]">↗️ Send</button>
                </div>
              </div>
            )}

            {/* FACEBOOK NATIVE CARD SIMULATOR */}
            {previewPlatform === "facebook" && (
              <div className="bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xl max-w-sm mx-auto p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5846A8] text-white flex items-center justify-center font-bold text-sm">
                    {accounts.find((a) => a.provider === previewPlatform)?.profileImageUrl ? (
                      <img
                        src={accounts.find((a) => a.provider === previewPlatform)!.profileImageUrl!}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "P").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {accounts.find((a) => a.provider === previewPlatform)?.displayName || activeBrand?.name || "PulseSocial Workspace"}
                    </p>
                    <p className="text-[10px] text-slate-400">Just now · 🌎</p>
                  </div>
                </div>

                <p className="text-xs text-slate-800 whitespace-pre-line">
                  {content || "Your Facebook Page update preview..."}
                </p>

                {mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-100 aspect-video relative">
                    <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
