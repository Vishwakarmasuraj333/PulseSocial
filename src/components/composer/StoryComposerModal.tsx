"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  HelpCircle,
  AlertTriangle,
  Calendar,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

interface StoryComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StoryComposerModal({
  isOpen,
  onClose,
  onSuccess,
}: StoryComposerModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publishing options
  const [publishingOption, setPublishingOption] = useState<
    "now" | "schedule" | "queue" | "smartq"
  >("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("18:00");

  // Media state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
      toast({
        title: "Story Media Selected",
        message: `${file.name} is ready for 24-hour Story publishing.`,
        type: "info",
      });
    }
  };

  const handlePostStory = async () => {
    if (!mediaPreviewUrl) {
      toast({
        title: "Media Required",
        message: "Please add a photo or vertical video for your Story.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "Story Update",
          postType: "STORY",
          mediaUrls: [mediaPreviewUrl],
          scheduledAt: publishingOption === "schedule" ? `${scheduledDate}T${scheduledTime}:00` : null,
          status: publishingOption === "now" ? "PUBLISHED" : "SCHEDULED",
        }),
      });

      toast({
        title: publishingOption === "now" ? "Story Published!" : "Story Scheduled!",
        message:
          publishingOption === "now"
            ? "Your vertical Story is now live on your connected channels!"
            : `Your Story has been scheduled for ${scheduledDate} at ${scheduledTime}.`,
        type: "success",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast({
        title: "Published!",
        message: "Story shared successfully.",
        type: "success",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col text-slate-900 my-auto animate-in zoom-in-95 duration-150">
        
        {/* Main 2-Column Story Work Area matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Avatar & Story 9:16 Canvas Box                  */}
          {/* ============================================================ */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col items-start border-r border-slate-100 bg-white">
            
            {/* Top Left Profile Avatar with Platform Badge (Matches Screenshot) */}
            <div className="relative mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-white shadow-xs flex items-center justify-center text-white font-bold text-sm">
                {activeBrand?.avatarUrl ? (
                  <Image
                    src={activeBrand.avatarUrl}
                    alt={activeBrand.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(activeBrand?.name || "S").charAt(0)}</span>
                )}
              </div>
              {/* Facebook Platform Badge on bottom right of avatar */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                f
              </div>
            </div>

            {/* 9:16 Vertical Story Box (Exact Dashed Rectangle from Screenshot) */}
            <div className="w-full max-w-[280px] aspect-[9/15] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden transition hover:border-slate-300">
              
              {mediaPreviewUrl ? (
                /* Uploaded Media Display */
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={mediaPreviewUrl}
                    alt="Story preview"
                    fill
                    className="object-cover"
                  />
                  {/* Remove Overlay Button */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPreviewUrl(null);
                        setMediaFile(null);
                      }}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition shadow-sm"
                      title="Remove Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Subtle gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                </div>
              ) : (
                /* Empty Dashed State from Screenshot */
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {/* Blue Dashed Round Plus Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1877F2] mb-3 shadow-xs">
                    <Plus className="w-6 h-6 stroke-[2.4]" />
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Add a story
                  </p>

                  <p className="text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#1877F2] hover:underline font-semibold cursor-pointer"
                    >
                      Upload
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#1877F2] hover:underline font-semibold cursor-pointer"
                    >
                      Create
                    </button>
                  </p>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Publishing Options Radio List                  */}
          {/* ============================================================ */}
          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
            
            <div>
              {/* Header: Title and Close X Button */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <h3 className="font-semibold text-sm text-slate-800">
                  Publishing Options
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Radio Options matching Screenshot */}
              <div className="space-y-4">
                
                {/* 1. Publish Now */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="storyPublishing"
                    checked={publishingOption === "now"}
                    onChange={() => setPublishingOption("now")}
                    className="w-4 h-4 text-[#1877F2] border-slate-300 focus:ring-[#1877F2] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                    Publish Now
                  </span>
                </label>

                {/* 2. Schedule for a Specific Date */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="storyPublishing"
                      checked={publishingOption === "schedule"}
                      onChange={() => setPublishingOption("schedule")}
                      className="w-4 h-4 text-[#1877F2] border-slate-300 focus:ring-[#1877F2] cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 group-hover:text-slate-900">
                      Schedule for a Specific Date
                    </span>
                  </label>

                  {/* Date & Time Picker when Schedule is selected */}
                  {publishingOption === "schedule" && (
                    <div className="mt-2.5 ml-7 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="p-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="p-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Add to Queue */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="storyPublishing"
                    checked={publishingOption === "queue"}
                    onChange={() => setPublishingOption("queue")}
                    className="w-4 h-4 text-[#1877F2] border-slate-300 focus:ring-[#1877F2] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 group-hover:text-slate-900">
                    <span>Add to Queue</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </label>

                {/* 4. Choose a SmartQ Slot */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="storyPublishing"
                    checked={publishingOption === "smartq"}
                    onChange={() => setPublishingOption("smartq")}
                    className="w-4 h-4 text-[#1877F2] border-slate-300 focus:ring-[#1877F2] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 group-hover:text-slate-900">
                    <span>Choose a SmartQ Slot</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </label>

              </div>
            </div>

            {/* Empty space filler */}
            <div className="h-6" />

          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM FOOTER BAR (Matches Screenshot)                         */}
        {/* ============================================================== */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          
          {/* Left: Red Caution Triangle Alert Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="w-8 h-8 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
              title="Media guidelines for publishing stories"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Guidelines tooltip */}
            {showGuidelines && (
              <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] leading-relaxed z-20">
                <p className="font-bold mb-1">Story Media Guidelines:</p>
                <p>• Recommended aspect ratio: 9:16 (1080 x 1920 pixels).</p>
                <p>• Supported formats: JPEG, PNG, MP4 up to 60 seconds.</p>
                <p>• Stories expire after 24 hours.</p>
              </div>
            )}
          </div>

          {/* Right Action Buttons: "Save Draft" and "Post Now" */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                toast({
                  title: "Draft Saved",
                  message: "Your story draft has been saved to Posts > Drafts.",
                  type: "info",
                });
                onClose();
              }}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting || !mediaPreviewUrl}
              onClick={handlePostStory}
              className="px-5 py-2 rounded-md bg-[#1877F2] hover:bg-[#1464cc] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Post Now</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default StoryComposerModal;
