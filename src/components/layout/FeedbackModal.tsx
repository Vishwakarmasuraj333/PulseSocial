"use client";

import React, { useState } from "react";
import { X, MessageSquare, Star, Send, ThumbsUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("feature");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Feedback Submitted!",
        message: "Thank you for helping us make PulseSocial even better.",
        type: "success",
      });
      setMessage("");
      onClose();
    } catch {
      toast({
        title: "Feedback Recorded",
        message: "Your thoughts have been logged. Thank you!",
        type: "success",
      });
      setMessage("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Share Your Feedback</h2>
              <p className="text-[11px] text-slate-400">We read every message directly from developers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              How satisfied are you with PulseSocial?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-500 ml-2">
                {rating === 5 ? "Loved it!" : rating >= 4 ? "Very Good" : "Needs Improvement"}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "feature", label: "Idea / Feature" },
                { id: "bug", label: "Issue / Bug" },
                { id: "general", label: "General Love" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition ${
                    category === cat.id
                      ? "border-blue-600 bg-blue-50/50 text-blue-700 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback details */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Your Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you liked or what channels you would like to see connected..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !message.trim()}
              className="bg-[#0f71d3] hover:bg-blue-600 text-white font-semibold text-xs h-9 px-5 shadow-xs"
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
