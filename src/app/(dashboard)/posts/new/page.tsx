"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { GeminiAiModal } from "@/components/composer/GeminiAiModal";
import {
  PostPreview,
  PreviewAccount,
  PreviewMediaItem,
} from "@/components/composer/previews/PostPreview";
import { getPlatformCapability } from "@/lib/social/capabilities";
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
  UploadCloud,
  X,
  Loader2,
  Plus,
  Video,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [content, setContent] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<PreviewAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [previewPlatform, setPreviewPlatform] = useState<string>("instagram");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Multi-media state
  const [media, setMedia] = useState<PreviewMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [directMediaUrl, setDirectMediaUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scheduling
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isPublishing, setIsPublishing] = useState(false);

  // Platform specific settings
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [isShorts, setIsShorts] = useState(false);

  // Load connected accounts from backend
  useEffect(() => {
    setIsLoadingAccounts(true);
    fetch("/api/social/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const liveAccs: PreviewAccount[] = [];
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
          setAccounts(liveAccs);
          setSelectedAccountIds([liveAccs[0].id]);
          setPreviewPlatform(liveAccs[0].provider);
        } else {
          // If no accounts are connected yet, create platform preview presets for the active workspace
          setAccounts([]);
          setSelectedAccountIds([]);
        }
      })
      .catch(() => {
        setAccounts([]);
      })
      .finally(() => {
        setIsLoadingAccounts(false);
      });
  }, []);

  const toggleAccount = (id: string, provider: string) => {
    setSelectedAccountIds((prev) => {
      const isAlreadySelected = prev.includes(id);
      if (isAlreadySelected) {
        const next = prev.filter((item) => item !== id);
        return next;
      } else {
        setPreviewPlatform(provider);
        return [...prev, id];
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const uploadedItems: PreviewMediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed for ${file.name}`);

        const isVideo = file.type.startsWith("video/");
        uploadedItems.push({
          id: `media-${Date.now()}-${i}`,
          url: data.url,
          type: isVideo ? "VIDEO" : "IMAGE",
          name: file.name,
          size: file.size,
        });
      }

      setMedia((prev) => [...prev, ...uploadedItems]);
      toast({
        title: "Media Attached",
        message: `${uploadedItems.length} file(s) uploaded successfully.`,
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

  const handleAddDirectUrl = () => {
    if (!directMediaUrl.trim()) return;
    const isVideo = directMediaUrl.match(/\.(mp4|mov|webm)$/i);
    setMedia((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: directMediaUrl.trim(),
        type: isVideo ? "VIDEO" : "IMAGE",
      },
    ]);
    setDirectMediaUrl("");
    toast({
      title: "Media URL Attached",
      message: "Creative visual added from external link.",
      type: "success",
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAction = async (action: "DRAFT" | "SCHEDULE" | "PUBLISH_NOW") => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: "Content Required",
        message: "Please enter your message caption or attach media.",
        type: "warning",
      });
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast({
        title: "Select Channel",
        message: "Please select at least one connected social channel.",
        type: "warning",
      });
      return;
    }

    // Check if selected accounts are real connected accounts
    const hasRealConnected = accounts.some(
      (a) => selectedAccountIds.includes(a.id) && a.isRealConnected
    );

    if (action === "PUBLISH_NOW" && !hasRealConnected) {
      toast({
        title: "No Live Connection",
        message:
          "Publishing requires a verified connected social account. Connect your channel in Settings -> Connected Accounts.",
        type: "error",
      });
      return;
    }

    setIsPublishing(true);

    try {
      let scheduledFor: string | undefined = undefined;
      if (action === "SCHEDULE" && scheduledDate) {
        scheduledFor = new Date(
          `${scheduledDate}T${scheduledTime || "12:00"}:00Z`
        ).toISOString();
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetAccountIds: selectedAccountIds,
          action,
          scheduledFor,
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Post action failed");

      toast({
        title:
          action === "PUBLISH_NOW"
            ? "Published Successfully!"
            : action === "SCHEDULE"
            ? "Post Scheduled!"
            : "Draft Saved!",
        message:
          action === "PUBLISH_NOW"
            ? "Your post is now live across your selected networks."
            : action === "SCHEDULE"
            ? `Post scheduled for ${scheduledDate} at ${scheduledTime}.`
            : "Post saved to your drafts queue.",
        type: "success",
      });

      router.push(action === "SCHEDULE" ? "/calendar" : "/posts");
    } catch (err: unknown) {
      toast({
        title: "Publish Error",
        message: (err as Error).message,
        type: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const capability = getPlatformCapability(previewPlatform);
  const isOverLimit = content.length > capability.maxCharacterLimit;

  // Selected accounts for preview
  const previewAccounts = accounts.filter((a) =>
    selectedAccountIds.includes(a.id)
  );

  // Fallback active preview account if none connected
  const activeFallbackAccount: PreviewAccount = {
    id: `preview-${previewPlatform}`,
    provider: previewPlatform,
    displayName: activeBrand?.name || "PulseSocial Workspace",
    username: activeBrand?.slug || "pulsesocial",
    profileImageUrl: activeBrand?.avatarUrl || null,
  };

  const previewList =
    previewAccounts.length > 0 ? previewAccounts : [activeFallbackAccount];

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
              Simultaneous multi-network broadcast with real-time native platform preview simulator.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => handleAction("DRAFT")}
              className="text-xs font-semibold rounded-xl cursor-pointer"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleAction("PUBLISH_NOW")}
              isLoading={isPublishing}
              disabled={isPublishing || isOverLimit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs cursor-pointer disabled:opacity-50"
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
                  <Plus className="w-3 h-3" /> Connect Social Account
                </Link>
              </div>

              {isLoadingAccounts ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading connected social channels...</span>
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">No social accounts connected yet</p>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                        Connect your official accounts (Instagram, LinkedIn, X, Facebook, etc.) to publish live.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/connections"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    + Connect Social Account
                  </Link>
                </div>
              ) : (
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
                        {acc.profileImageUrl ? (
                          <img
                            src={acc.profileImageUrl}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          renderPlatformIcon(acc.provider, 15)
                        )}
                        <span className="truncate max-w-[120px]">{acc.displayName}</span>
                        {acc.username && (
                          <span className="text-[10px] opacity-60">@{acc.username}</span>
                        )}
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-0.5" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* YouTube Specific Fields when YouTube selected */}
            {(previewPlatform === "youtube" ||
              selectedAccountIds.some(
                (id) => accounts.find((a) => a.id === id)?.provider === "youtube"
              )) && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-200/80 dark:border-red-900/40 shadow-xs space-y-3">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  {renderPlatformIcon("youtube", 16)} YouTube Broadcast Settings
                </span>
                <Input
                  placeholder="Enter YouTube Video Title (Required for YouTube)..."
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShorts}
                    onChange={(e) => setIsShorts(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Format as YouTube Shorts (Vertical 9:16 Video)</span>
                </label>
              </div>
            )}

            {/* Text Editor Area */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share across your channels? Craft your message, paste links, or generate publication-ready copy with Gemini AI..."
                className="w-full text-sm bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white leading-relaxed"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setContent((prev) => `${prev} #Growth #Innovation #Trending `)
                    }
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
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Create with Gemini AI
                  </button>
                </div>

                {/* Character Counter */}
                <div className="text-xs font-semibold">
                  <span
                    className={
                      isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"
                    }
                  >
                    {content.length}
                  </span>
                  <span className="text-slate-400">
                    {" "}
                    / {capability.maxCharacterLimit} ({capability.displayName})
                  </span>
                </div>
              </div>
            </div>

            {/* Media Attachment Section */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" /> Attached Creative Visuals ({media.length})
                </label>
                {media.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMedia([])}
                    className="text-xs font-medium text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Remove All
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isUploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>
                    {isUploadingMedia ? "Uploading Media..." : "Upload Images / Video"}
                  </span>
                </button>
                <span className="text-xs text-slate-400 hidden sm:inline">or</span>
                <div className="flex items-center gap-1 flex-1 w-full">
                  <Input
                    type="url"
                    placeholder="Paste direct image or video URL..."
                    value={directMediaUrl}
                    onChange={(e) => setDirectMediaUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDirectUrl();
                      }
                    }}
                    className="flex-1 rounded-xl text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDirectUrl}
                    disabled={!directMediaUrl.trim()}
                    className="text-xs rounded-xl cursor-pointer"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Multi-Media Gallery Strip */}
              {media.length > 0 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
                  {media.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 group shadow-xs"
                    >
                      {item.type?.toUpperCase() === "VIDEO" ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                          <Video className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                        title="Remove visual"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                        {item.type}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">+ Add More</span>
                  </button>
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
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

              {/* Quick Preview Channel Switcher across all supported networks */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto max-w-[280px] scrollbar-none">
                {[
                  "instagram",
                  "facebook",
                  "linkedin",
                  "x",
                  "tiktok",
                  "youtube",
                  "pinterest",
                  "threads",
                  "google",
                  "mastodon",
                ].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewPlatform === plat
                        ? "bg-white dark:bg-slate-900 shadow-xs text-indigo-600"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    title={plat.toUpperCase()}
                  >
                    {renderPlatformIcon(plat, 15)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Native Platform Preview Renderer */}
            <PostPreview
              accounts={previewList}
              activeAccountId={
                previewAccounts.find((a) => a.provider === previewPlatform)?.id ||
                previewList[0]?.id
              }
              onSelectAccount={(id) => {
                const found = accounts.find((a) => a.id === id);
                if (found) setPreviewPlatform(found.provider);
              }}
              onOpenConnectModal={() => router.push("/connections")}
              content={content}
              media={media}
              youtubeTitle={youtubeTitle}
              isShorts={isShorts}
            />
          </div>
        </div>

        {/* Real Verified Gemini AI Assistant Modal */}
        <GeminiAiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          brandName={activeBrand?.name || "PulseSocial"}
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
