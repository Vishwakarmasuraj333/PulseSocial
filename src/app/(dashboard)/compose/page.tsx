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
                <div className="flex flex-wrap items-center gap-2">
                  {connectedAccounts.map((acc) => {
                    const isSelected = selectedPlatforms.includes(acc.platform);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => togglePlatform(acc.platform)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#f5f3ff] dark:bg-purple-950/60 border-[#5846A8] text-[#5846A8] dark:text-purple-300 shadow-xs ring-1 ring-[#5846A8]"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center">
                          {renderPlatformIcon(acc.platform, 16)}
                        </div>
                        <span>{acc.name}</span>
                      </button>
                    );
                  })}
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
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 sticky top-6">
            
            {/* Preview Platform Switcher */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Eye className="w-4 h-4 text-[#5846A8]" />
                <span>Live Feed Preview</span>
              </div>

              <div className="flex items-center gap-1">
                {selectedPlatforms.map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setActivePreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      activePreviewPlatform === plat
                        ? "bg-white dark:bg-slate-800 shadow-xs text-[#5846A8]"
                        : "opacity-40 hover:opacity-100"
                    }`}
                    title={`Preview on ${plat}`}
                  >
                    {renderPlatformIcon(plat, 18)}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Post Mockup Card */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md p-4 overflow-hidden">
              
              {/* Profile Header */}
              {(() => {
                const currentAcc = connectedAccounts.find((a) => a.platform === activePreviewPlatform);
                const displayName = currentAcc?.name || activeBrand?.name || "PulseSocial Workspace";
                const handle = currentAcc?.username ? `@${currentAcc.username}` : "@pulsesocial";
                return (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5846A8] text-white p-0.5 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                      {currentAcc?.avatar ? (
                        <img
                          src={currentAcc.avatar}
                          alt="Author"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</span>
                        <span className="text-[10px] text-slate-400">{handle}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Just now • Published via PulseSocial</span>
                    </div>
                  </div>
                );
              })()}

              {/* Post Text */}
              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap mb-3">
                {content || "Your post caption will appear here in real-time as you write..."}
              </div>

              {/* Post Image Preview */}
              {mediaUrls.length > 0 && (
                <div className="rounded-lg overflow-hidden mb-3 border border-slate-100 dark:border-slate-800">
                  <img src={mediaUrls[0]} alt="Post Visual" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Interaction Metrics */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-slate-400">
                <span>❤️ 0 Likes</span>
                <span>💬 0 Comments</span>
                <span>🔄 0 Shares</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
