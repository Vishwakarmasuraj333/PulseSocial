"use client";

import React, { useState } from "react";
import { X, MessageSquare, Star, Sparkles, Bug, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "feature", label: "Idea / Feature", icon: Sparkles, color: "text-amber-500" },
  { id: "bug", label: "Issue / Bug", icon: Bug, color: "text-rose-500" },
  { id: "general", label: "General Love", icon: Heart, color: "text-pink-500" },
];

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement 😕",
  2: "Fair 🙂",
  3: "Good & Useful 👍",
  4: "Very Good! 🚀",
  5: "Loved it! 🌟",
};

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("feature");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Message Required",
        message: "Please write a brief note for your feedback.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        message: "Thank you! Your feedback has been forwarded directly to the team.",
        type: "success",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setMessage("");
        onClose();
      }, 1400);
    } catch (err: unknown) {
      toast({
        title: "Submission Error",
        message: (err as Error).message || "Could not log feedback.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarCount = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Share Your Feedback</h2>
              <p className="text-[11px] text-slate-400">We read every message directly from creators</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Thank You!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your feedback has been logged into our product engine. We appreciate your insights!
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Rating */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                How satisfied are you with PulseSocial?
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= activeStarCount
                            ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                            : "text-slate-200 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
                  {RATING_LABELS[activeStarCount] || "Loved it!"}
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-2.5 rounded-xl border text-center font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback details */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Message
                </label>
                <span className="text-[10px] text-slate-400">{message.length} / 500</span>
              </div>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you loved or features you'd like to see added..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder:text-slate-400 leading-relaxed transition"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-9 px-4 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
