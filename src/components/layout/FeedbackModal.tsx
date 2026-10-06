"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Minus,
  Maximize2,
  Paperclip,
  FileText,
  ImageIcon,
  Sparkles,
  Bug,
  Zap,
  CreditCard,
  Heart,
  CheckCircle2,
  Loader2,
  Info,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

const CATEGORIES = [
  { id: "feature", label: "Feature / Idea", icon: Sparkles, color: "text-amber-500" },
  { id: "bug", label: "Issue / Bug", icon: Bug, color: "text-rose-500" },
  { id: "performance", label: "Speed & Performance", icon: Zap, color: "text-blue-500" },
  { id: "billing", label: "Account & Billing", icon: CreditCard, color: "text-purple-500" },
  { id: "general", label: "General Feedback", icon: Heart, color: "text-pink-500" },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("feature");
  const [rating, setRating] = useState(5);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when closing/opening
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
      setIsCategoryPickerOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        message: "Maximum attachment size is 25MB.",
        type: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
      toast({
        title: "File Attached",
        message: `${file.name} attached to feedback.`,
        type: "success",
      });
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentCategory =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() && !description.trim()) {
      toast({
        title: "Feedback Details Required",
        message: "Please enter a subject or description for your feedback.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        subject: subject.trim(),
        description: description.trim(),
        category,
        rating,
      };

      if (attachedFile) {
        payload.attachment = {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type,
          dataUrl: attachedFile.dataUrl,
        };
        payload.attachmentName = attachedFile.name;
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback Received!",
        message: "Thank you! Your feedback has been sent directly to the product team.",
        type: "success",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setSubject("");
        setDescription("");
        setAttachedFile(null);
        setIsCategoryPickerOpen(false);
        onClose();
      }, 1600);
    } catch (err: unknown) {
      toast({
        title: "Submission Failed",
        message: (err as Error).message || "Could not log feedback.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hidden file input for native dynamic file open */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.log,.json,.csv"
        onChange={handleFileChange}
        className="hidden"
        id="pulse-feedback-file-input"
      />

      {/* Floating Bottom-Right Zoho Social Style Docked Widget */}
      <div
        className={`fixed bottom-12 right-4 sm:right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] border border-slate-200 dark:border-slate-800 flex flex-col overflow-visible animate-in slide-in-from-bottom-3 duration-200 text-slate-900 dark:text-white ${
          isMinimized ? "h-auto" : ""
        }`}
      >
        {/* Downward triangle pointer pointing toward dock's Feedback button */}
        <div className="absolute -bottom-1.5 right-12 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 rotate-45 pointer-events-none" />

        {/* 1. Header: Solid Zoho Blue */}
        <div className="relative flex items-center justify-between px-5 py-3.5 bg-[#1e70eb] text-white rounded-t-xl select-none">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Share Your Feedback
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Minimize / Maximize button */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              title={isMinimized ? "Expand Feedback" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Floating White Paperclip Action Button overlapping header & body */}
          {!isMinimized && (
            <button
              type="button"
              onClick={handleOpenFileDialog}
              title="Attach File or Screenshot"
              className="absolute right-5 top-11 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:text-[#1e70eb] dark:hover:text-[#1e70eb] hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 group"
            >
              <Paperclip className="w-5 h-5 transition-transform group-hover:rotate-12 text-slate-600 dark:text-slate-300 group-hover:text-[#1e70eb]" />
              {attachedFile && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* 2. Main Body (hidden when minimized) */}
        {!isMinimized && (
          <div className="p-5 pt-6 bg-white dark:bg-slate-900 rounded-b-xl">
            {isSubmitted ? (
              <div className="py-8 px-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thank You!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your feedback and attachments have been received and logged directly into our product system.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Subject */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e70eb]/20 focus:border-[#1e70eb] transition placeholder:text-slate-400"
                  />
                </div>

                {/* Field 2: Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what you liked or what needs improvement..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e70eb]/20 focus:border-[#1e70eb] resize-none transition placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

                {/* Attached File Preview Chip */}
                {attachedFile && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachedFile.type.startsWith("image/") && attachedFile.dataUrl ? (
                        <div className="w-8 h-8 rounded border border-blue-200 dark:border-blue-800 overflow-hidden shrink-0 bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={attachedFile.dataUrl}
                            alt="Attachment preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 text-[#1e70eb] flex items-center justify-center shrink-0">
                          {attachedFile.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[210px]">
                          {attachedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(attachedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Category Picker Popover / Dropdown */}
                {isCategoryPickerOpen && (
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5 animate-in fade-in duration-150">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Select Feedback Category
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategory(cat.id);
                              setIsCategoryPickerOpen(false);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                              isSelected
                                ? "bg-[#1e70eb] text-white font-semibold shadow-xs"
                                : "hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${
                                isSelected ? "text-white" : cat.color
                              }`}
                            />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Category selector trigger on left & Submit button on right */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {/* Category link / badge matching Zoho Social's exact "ⓘ Choose your feedback category" */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#1e70eb] dark:hover:text-[#1e70eb] transition cursor-pointer font-medium py-1 text-left"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[190px]">
                      {category ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          {currentCategory.label}
                          <ChevronDown className="w-3 h-3 text-slate-400 inline" />
                        </span>
                      ) : (
                        "Choose your feedback category"
                      )}
                    </span>
                  </button>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || (!subject.trim() && !description.trim())}
                    className="bg-[#1e70eb] hover:bg-[#185ec4] text-white font-medium text-xs h-9 px-6 rounded-lg shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Submit</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
