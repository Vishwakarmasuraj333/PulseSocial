"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { postService, aiService } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import {
  Sparkles,
  Calendar,
  Send,
  Save,
  Image as ImageIcon,
  Video,
  Hash,
  Smile,
  AtSign,
  Link2,
  Trash2,
  Loader2,
  CheckCircle2,
  UploadCloud,
  X,
  Eye,
} from "lucide-react";
import {
  PostPreview,
  PreviewAccount,
  PreviewMediaItem,
} from "@/components/composer/previews/PostPreview";

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 500,
};

export default function ComposePage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<string>("instagram");
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/social/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const accs: any[] = [];
        (data?.providers || []).forEach((p: any) => {
          if (p.isConnected && p.connectedAccount) {
            accs.push({
              id: p.connectedAccount.id || p.platform,
              platform: p.platform,
              name: p.connectedAccount.displayName || p.name,
              username: p.connectedAccount.username,
              avatar: p.connectedAccount.profileImageUrl,
              publishingStatus:
                p.connectedAccount.publishingStatus || p.publishingStatus || "Ready to publish",
              publishingAvailable: Boolean(
                p.connectedAccount.publishingAvailable ?? p.publishingAvailable ?? false
              ),
              tokenStatus:
                p.connectedAccount.tokenStatus || p.tokenStatus || "MISSING",
              capabilityNotes:
                p.connectedAccount.capabilityNotes ||
                p.platformCapability?.unsupportedMessage ||
                p.platformCapability?.notes,
            });
          }
        });
        setConnectedAccounts(accs);
        if (accs.length > 0) {
          setSelectedPlatforms(accs.map((a) => a.platform));
          setActivePreviewPlatform(accs[0].platform);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setMediaUrls((prev) => [...prev, data.url]);
      toast({
        title: "Media Uploaded",
        message: "File attached successfully to your post.",
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Upload Failed",
        message: (err as Error).message || "Failed to upload media file.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Check if draft was passed from PulseAI
  useEffect(() => {
    const draft = sessionStorage.getItem("pulse_draft");
    if (draft) {
      setContent(draft);
      sessionStorage.removeItem("pulse_draft");
    }
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((p) => p !== id);
      }
      return [...prev, id];
    });
    if (!selectedPlatforms.includes(id)) {
      setActivePreviewPlatform(id);
    }
  };

  const handleAIAssist = async () => {
    if (!content.trim()) {
      toast({
        title: "Prompt needed",
        message: "Type a few words or a topic first so PulseAI can optimize it.",
        type: "info",
      });
      return;
    }

    setIsAIGenerating(true);
    try {
      const enhanced = await aiService.generateCaption(content, activePreviewPlatform);
      setContent(enhanced);
      toast({
        title: "Enhanced with PulseAI",
        message: "Your caption has been rewritten for peak engagement.",
        type: "success",
      });
    } catch {
      toast({
        title: "AI Failed",
        message: "Could not enhance text right now.",
        type: "error",
      });
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handlePublish = async (status: "PUBLISHED" | "SCHEDULED" | "DRAFT") => {
    if (!content.trim() && mediaUrls.length === 0) {
      toast({
        title: "Empty Post",
        message: "Please write some text or attach media before publishing.",
        type: "error",
      });
      return;
    }

    const selectedAccs = connectedAccounts.filter((a) => selectedPlatforms.includes(a.platform));
    const unpublishable = selectedAccs.filter((a) => !a.publishingAvailable);

    if (status === "PUBLISHED" && unpublishable.length > 0) {
      const first = unpublishable[0];
      toast({
        title: first.publishingStatus || "Publishing Restricted",
        message: `${first.name}: ${first.publishingStatus}${first.capabilityNotes ? ` (${first.capabilityNotes})` : ""}. Please save as draft or reauthorize.`,
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledFor =
        status === "SCHEDULED"
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : new Date().toISOString();

      await postService.createPost({
        content,
        mediaUrls,
        platforms: selectedPlatforms,
        scheduledFor,
        status,
      });

      toast({
        title: status === "PUBLISHED" ? "Post Published!" : status === "SCHEDULED" ? "Post Scheduled!" : "Draft Saved",
        message: `Successfully processed for ${selectedPlatforms.length} platform(s).`,
        type: "success",
      });

      setContent("");
      setMediaUrls([]);
    } catch (err: unknown) {
      toast({
        title: "Error",
        message: (err as Error).message || "Could not publish post",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLimit = PLATFORM_LIMITS[activePreviewPlatform] || 2200;
  const charsRemaining = currentLimit - content.length;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Post
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Craft, preview, and schedule content across all your social channels simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePublish("DRAFT")}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handlePublish("PUBLISHED")}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#5846A8] hover:bg-[#48388d] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publish Now</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Composer & Live Social Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================ */}
          {/* LEFT: Channel Selector & Content Editor (7 Cols)             */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            
            {/* 1. Platform Chips Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Platforms to Publish:
              </label>

              {connectedAccounts.length === 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#f5f3ff] dark:bg-purple-950/20 border border-[#ede9fe] dark:border-purple-800/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">No social accounts connected yet.</p>
                    <p className="text-[11px] text-slate-500">Connect a social channel to author and publish multi-channel updates.</p>
                  </div>
                  <Link
                    href="/connections"
                    className="px-3.5 py-1.5 rounded-lg bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold shadow-xs transition w-fit"
                  >
                    Connect a social account
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {connectedAccounts.map((acc) => {
                      const isSelected = selectedPlatforms.includes(acc.platform);
                      const status = acc.publishingStatus || "Ready to publish";

                      const badgeStyle =
                        status === "Ready to publish"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : status === "Connected — Publishing approval required"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          : status === "Reauthorization required"
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

                      return (
                        <div key={acc.id} className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => togglePlatform(acc.platform)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                              isSelected
                                ? "bg-[#f5f3ff] dark:bg-purple-950/60 border-[#5846A8] text-[#5846A8] dark:text-purple-300 shadow-xs ring-1 ring-[#5846A8]"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <div className="w-4 h-4 rounded-full flex items-center justify-center">
                              {renderPlatformIcon(acc.platform, 16)}
                            </div>
                            <span className="font-semibold">{acc.name}</span>
                          </button>

                          {/* Truthful Publishing Status Badge (Requirement 3) */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border tracking-tight ${badgeStyle}`}
                            title={acc.capabilityNotes || status}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                status === "Ready to publish"
                                  ? "bg-emerald-500"
                                  : status === "Connected — Publishing approval required"
                                  ? "bg-amber-500"
                                  : status === "Reauthorization required"
                                  ? "bg-rose-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning banner for unpublishable channels */}
                  {connectedAccounts
                    .filter((a) => selectedPlatforms.includes(a.platform) && !a.publishingAvailable)
                    .length > 0 && (
                    <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-4 h-4 text-amber-600">⚠️</span>
                        <span>Publishing Notice for Selected Channels:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                        {connectedAccounts
                          .filter((a) => selectedPlatforms.includes(a.platform) && !a.publishingAvailable)
                          .map((a) => (
                            <li key={a.id}>
                              <span className="font-semibold">{a.name}:</span> {a.publishingStatus}
                              {a.capabilityNotes ? ` (${a.capabilityNotes})` : ""}
                            </li>
                          ))}
                      </ul>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-400 pt-0.5">
                        Direct publishing is blocked until external approvals or credentials are ready. You can still save as draft or schedule.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Rich Content Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Post Caption & Copy
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isAIGenerating}
                  className="text-xs font-semibold text-[#5846A8] dark:text-purple-400 hover:text-[#48388d] flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAIGenerating ? "animate-spin" : ""}`} />
                  <span>{isAIGenerating ? "Polishing with AI..." : "Enhance with PulseAI"}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? Share updates, links, announcements, or stories with your audience..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5846A8] resize-none leading-relaxed transition"
              />

              {/* Character Counter & Helper Toolbar */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setContent((c) => c + " #PulseSocial #Growth ")}
                    className="p-1 hover:text-[#5846A8] transition cursor-pointer"
                    title="Add Hashtags"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((c) => c + " 🚀✨ ")}
                    className="p-1 hover:text-[#5846A8] transition cursor-pointer"
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((c) => c + " @")}
                    className="p-1 hover:text-[#5846A8] transition cursor-pointer"
                    title="Mention Account"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                </div>

                <div className={`font-mono text-xs ${charsRemaining < 0 ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                  {content.length} / {currentLimit} chars
                </div>
              </div>
            </div>

            {/* 3. Media Upload Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Attached Media
              </label>

              {/* Uploaded media previews */}
              {mediaUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={url} alt="Attached" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMediaUrls((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Media drop box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#5846A8] rounded-xl p-6 text-center cursor-pointer transition hover:bg-[#f5f3ff]/40 dark:hover:bg-slate-950/40 relative"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="w-8 h-8 text-[#5846A8] animate-spin mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Uploading media...
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-[#5846A8] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to browse and upload creative
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP or MP4 supported
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 4. Scheduling Options */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5846A8]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Schedule for later:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handlePublish("SCHEDULED")}
                  disabled={isSubmitting || !scheduledDate}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5846A8] hover:bg-[#48388d] text-white disabled:opacity-50 transition cursor-pointer"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: Live Social Preview (5 Cols)                          */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Native Preview
              </span>

              {/* Quick Preview Channel Switcher */}
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
                    onClick={() => setActivePreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      activePreviewPlatform === plat
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

            {/* Dynamic Native Platform Post Preview */}
            <PostPreview
              accounts={
                connectedAccounts.length > 0
                  ? connectedAccounts.map((a) => ({
                      id: a.id,
                      provider: a.platform,
                      displayName: a.name || activeBrand?.name || "PulseSocial Workspace",
                      username: a.username || "pulsesocial",
                      profileImageUrl: a.avatar || activeBrand?.avatarUrl || null,
                    }))
                  : [
                      {
                        id: `preview-${activePreviewPlatform}`,
                        provider: activePreviewPlatform,
                        displayName: activeBrand?.name || "PulseSocial Workspace",
                        username: activeBrand?.slug || "pulsesocial",
                        profileImageUrl: activeBrand?.avatarUrl || null,
                      },
                    ]
              }
              activeAccountId={
                connectedAccounts.find((a) => a.platform === activePreviewPlatform)?.id ||
                `preview-${activePreviewPlatform}`
              }
              onSelectAccount={(id) => {
                const found = connectedAccounts.find((a) => a.id === id);
                if (found) setActivePreviewPlatform(found.platform);
              }}
              content={content}
              media={mediaUrls.map((url, idx) => ({
                id: `media-${idx}`,
                url,
                type: url.match(/\.(mp4|mov|webm)$/i) ? "VIDEO" : "IMAGE",
              }))}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
