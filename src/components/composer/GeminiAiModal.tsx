"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { GeminiIcon } from "@/components/icons/PlatformIcons";
import {
  X,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  ArrowRight,
  Hash,
  MessageCircle,
  MapPin,
  Sliders,
  ExternalLink,
  Key,
} from "lucide-react";

interface GeminiAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  industry?: string;
  onApply: (data: {
    caption: string;
    firstComment?: string;
    hashtags?: string[];
    location?: string;
  }) => void;
}

const TONES = [
  "Engaging & Viral",
  "Professional & Corporate",
  "Casual & Friendly",
  "Inspirational & Bold",
  "Thought Leadership",
  "Urgent Announcement",
];

const PROMPT_SUGGESTIONS = [
  "Announce an exclusive product release with limited-time 20% discount",
  "Share a behind-the-scenes look at our creative team and company culture",
  "Post a weekly industry tip with 3 actionable takeaways for our audience",
  "Celebrate hitting a major brand milestone and thank our community",
];

export function GeminiAiModal({
  isOpen,
  onClose,
  brandName,
  industry = "Digital Marketing",
  onApply,
}: GeminiAiModalProps) {
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Engaging & Viral");
  const [selectedPlatform, setSelectedPlatform] = useState("general");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);
  const [includeFirstComment, setIncludeFirstComment] = useState(true);

  // Custom API key state if missing in .env
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    hook: string;
    caption: string;
    hashtags: string[];
    firstComment?: string;
    suggestedLocation?: string;
  } | null>(null);

  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Needed",
        message: "Please describe what topic or announcement you'd like Gemini to generate.",
        type: "warning",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          brandName,
          industry,
          tone: selectedTone,
          platform: selectedPlatform,
          includeHashtags,
          includeCta,
          includeFirstComment,
          customApiKey: apiKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresKey) {
          setShowKeyInput(true);
          toast({
            title: "Gemini API Key Required",
            message: "Enter your Google Gemini API key from Google AI Studio to generate real social copy.",
            type: "warning",
          });
          return;
        }
        throw new Error(data.message || data.error || "Generation failed");
      }

      setGeneratedData(data.result);
      toast({
        title: "Content Generated!",
        message: "Gemini AI crafted high-engagement social copy.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "AI Generation Error",
        message: err.message || "Failed to generate copy with Gemini AI.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToPost = () => {
    if (!generatedData) return;

    onApply({
      caption: generatedData.caption,
      firstComment: generatedData.firstComment,
      hashtags: generatedData.hashtags,
      location: generatedData.suggestedLocation,
    });

    toast({
      title: "Applied to Post!",
      message: "Generated caption, first comment, and hashtags were inserted into your composer.",
      type: "success",
    });
    onClose();
  };

  const handleCopyCaption = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
    toast({
      title: "Copied to Clipboard",
      message: "Post caption copied.",
      type: "info",
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      className="p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white text-slate-800"
    >
      <div className="flex flex-col h-full max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center border border-blue-200/50 shadow-xs">
              <GeminiIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Gemini AI Social Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xs">
                  REAL GEMINI API
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate high-engagement captions, hooks, and first comments for {brandName}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Optional API Key banner if user wants to supply their own */}
          {showKeyInput && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" /> Enter Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-normal"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-blue-800">
                You can also permanently add <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> to your <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">.env</code> file.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Topic / Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              What would you like to post about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Announcing our new summer collection with free shipping, asking what style they love most..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed text-slate-800 placeholder:text-slate-400"
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sugg)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition truncate max-w-[280px]"
                >
                  💡 {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Tone of Voice
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedTone === tone
                      ? "bg-blue-600 text-white shadow-2xs font-semibold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span>Hashtags</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCta}
                onChange={(e) => setIncludeCta(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span>Call-To-Action</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFirstComment}
                onChange={(e) => setIncludeFirstComment(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span>First Comment</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs tracking-wide shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Social Post with Gemini</span>
              </>
            )}
          </button>

          {/* Generated Result Card */}
          {generatedData && (
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3.5 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Gemini Generated Result
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-[11px] font-medium flex items-center gap-1"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCaption ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyToPost}
                    className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Apply to Post</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Attention Hook */}
              {generatedData.hook && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Attention Hook
                  </span>
                  <p className="font-semibold text-slate-900 text-xs mt-0.5">
                    {generatedData.hook}
                  </p>
                </div>
              )}

              {/* Full Caption */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Post Caption
                </span>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed mt-0.5 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  {generatedData.caption}
                </p>
              </div>

              {/* Hashtags */}
              {generatedData.hashtags && generatedData.hashtags.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Suggested Hashtags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {generatedData.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* First Comment */}
              {generatedData.firstComment && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-amber-700" />
                    Strategic First Comment
                  </span>
                  <p className="text-amber-950 text-xs mt-0.5">
                    &quot;{generatedData.firstComment}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
