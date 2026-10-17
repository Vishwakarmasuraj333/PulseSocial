"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import {
  X,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ZiaCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
  onApply: (data: { caption: string; imageUrl?: string }) => void;
}

export function ZiaCopilotModal({
  isOpen,
  onClose,
  brandName = "Pulse Workspace",
  onApply,
}: ZiaCopilotModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [category, setCategory] = useState("Social Media Post");
  const [prompt, setPrompt] = useState("");
  const [includeImages, setIncludeImages] = useState(true);
  const [tone, setTone] = useState("Normal");
  const [language, setLanguage] = useState("English");

  // Result state
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [suggestedImageUrl, setSuggestedImageUrl] = useState<string | null>(null);
  const [imageSelected, setImageSelected] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleStartGeneration = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        message: "Please enter what you want to write about (e.g. 'shiv img' or 'hii am').",
        type: "warning",
      });
      return;
    }

    setStep("generating");

    try {
      // 1. Call real Google Gemini Social Copy API
      const res = await fetch("/api/ai/gemini/social-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          brandName: brandName || "SocialPulse",
          industry: "Digital & Social Media Marketing",
          tone: tone === "Normal" ? "Engaging & Viral" : tone,
          language,
          includeHashtags: true,
          includeFirstComment: true,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gemini generation could not be completed.");
      }

      let fullCaption = (data.primaryCaption || "").trim();
      if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
        const hashtagsString = data.hashtags.join(" ");
        if (!fullCaption.includes(data.hashtags[0])) {
          fullCaption = `${fullCaption}\n\n${hashtagsString}`;
        }
      }

      setGeneratedCaption(fullCaption);

      // 2. Generate Real AI Visual if requested
      let generatedImage: string | null = null;
      if (includeImages) {
        try {
          const imgRes = await fetch("/api/ai/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: data.imagePrompt || prompt.trim(),
              brandName: brandName || "SocialPulse",
              aspectRatio: "1:1",
              style: "realistic",
            }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData?.imageUrl) {
              generatedImage = imgData.imageUrl;
            }
          }
        } catch (imgErr) {
          console.warn("[Copilot Image Generation Warning]", imgErr);
        }
      }

      setSuggestedImageUrl(generatedImage);
      setImageSelected(Boolean(generatedImage));

      setStep("result");
    } catch (err: any) {
      setStep("input");
      toast({
        title: "Gemini Generation Failed",
        message: err.message || "Failed to generate copy from Google Gemini. Please check prompt and retry.",
        type: "error",
      });
    }
  };

  const handleCopyCaption = () => {
    if (!generatedCaption) return;
    navigator.clipboard.writeText(generatedCaption);
    setIsCopied(true);
    toast({
      title: "Copied to Clipboard",
      message: "Generated caption copied successfully.",
      type: "success",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleApplyToCompose = () => {
    onApply({
      caption: generatedCaption,
      imageUrl: imageSelected && suggestedImageUrl ? suggestedImageUrl : undefined,
    });
    onClose();
    toast({
      title: "Added to Compose",
      message: "AI caption & suggested media applied to composer.",
      type: "success",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B45309] to-[#F59E0B] flex items-center justify-center text-slate-950 shadow-md shadow-amber-900/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">SocialPulse AI Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">SocialPulse AI &middot; Multimodal Gemini Engine</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* STEP 1: PROMPT INPUT                                        */}
          {/* ============================================================ */}
          {step === "input" && (
            <div className="p-6 space-y-4">
              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Content Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Social Media Post",
                    "Announcement",
                    "Promotion / Sale",
                    "Event",
                    "Story / Reel",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        category === cat
                          ? "bg-gradient-to-r from-[#F59E0B] via-[#E08738] to-[#D97706] text-slate-950 font-bold shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Enter your prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like Google Gemini to write about? e.g. Announcing our 2026 product release, or tips for remote marketing teams..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-[#E08738]/40 resize-none leading-relaxed text-slate-900 dark:text-white"
                  autoFocus
                />

                {/* Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">Quick ideas:</span>
                  {[
                    { label: "Product Launch 🚀", promptText: "Announcing our breakthrough new platform feature with top benefits" },
                    { label: "5 Growth Tips 💡", promptText: "5 actionable social media growth strategies for modern founders" },
                    { label: "Engagement Hook 🔥", promptText: "Thought-provoking community question about AI and digital marketing" },
                    { label: "Customer Win ✨", promptText: "Inspiring customer success milestone and results story" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setPrompt(chip.promptText)}
                      className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Images Checkbox matching screenshot */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <input
                  id="include-images-toggle"
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E08738] focus:ring-[#E08738] cursor-pointer"
                />
                <label
                  htmlFor="include-images-toggle"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
                >
                  Include Images in the content
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">
                    Automatically suggests &amp; matches high-res creative visual assets
                  </span>
                </label>
              </div>

              {/* Tone & Language Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Engaging &amp; Viral">Engaging &amp; Viral</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual &amp; Fun">Casual &amp; Fun</option>
                    <option value="Inspirational">Inspirational</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">
                  Gemini 3.1 Flash Lite &middot; 600ms latency
                </span>
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={!prompt.trim()}
                  className="px-6 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: ANIMATED MAGIC GENERATING SCREEN (Exact Screenshot) */}
          {/* ============================================================ */}
          {step === "generating" && (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[360px]">
              {/* Cute Animated Magic Pencil Drawing Illustration */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Pulsing glow background */}
                <div className="absolute inset-0 rounded-full bg-purple-200/50 dark:bg-purple-950/40 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center shadow-inner" />

                {/* Animated drawing pencil */}
                <div className="relative z-10 animate-bounce duration-1000">
                  <Wand2 className="w-12 h-12 text-[#5846A8] dark:text-purple-400 rotate-12 transition-transform drop-shadow-md" />
                </div>

                {/* Orbiting sparkles */}
                <Sparkles className="w-5 h-5 text-amber-400 absolute top-1 right-2 animate-pulse" />
                <Sparkles className="w-4 h-4 text-sky-400 absolute bottom-2 left-2 animate-pulse delay-150" />
                <Sparkles className="w-4 h-4 text-purple-400 absolute top-4 left-3 animate-pulse delay-300" />
              </div>

              {/* Exact user headline from screenshot */}
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                  Say abracadabra while we generate the content for you!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Synthesizing viral social copy, crafting high-converting hashtags, and curating visual assets...
                </p>
              </div>

              {/* Shimmer loading bar */}
              <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-[#5846A8] via-purple-400 to-[#5846A8] rounded-full animate-indeterminate" />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: RESULT & SUGGESTION SCREEN (Exact Screenshot)       */}
          {/* ============================================================ */}
          {step === "result" && (
            <div className="p-6 space-y-4">
              {/* Generated Caption Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Generated Content</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-wrap">
                  {generatedCaption}
                </div>
              </div>

              {/* Image Suggestions Section matching user screenshot */}
              {suggestedImageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      IMAGE SUGGESTIONS
                    </span>
                    <span className="text-[10px] text-[#5846A8] dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                      1 Asset Matched
                    </span>
                  </div>

                  <div
                    onClick={() => setImageSelected(!imageSelected)}
                    className={`relative w-36 h-36 rounded-xl overflow-hidden border-2 transition cursor-pointer group shadow-sm ${
                      imageSelected
                        ? "border-[#5846A8] ring-2 ring-[#5846A8]/30"
                        : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={suggestedImageUrl}
                      alt="Suggested asset"
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {imageSelected && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#5846A8] text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-white text-[9px] text-center font-medium truncate">
                      {suggestedImageUrl.includes("shiv")
                        ? "Lord Shiva Artwork"
                        : suggestedImageUrl.includes("boy")
                        ? "Portrait in White Jacket"
                        : "Creative Social Asset"}
                    </div>
                  </div>
                </div>
              )}

              {/* Exact Credits Bar from screenshot */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                  <span>Credits used - 33.456</span>
                  <span>Credits remaining - 46.544 / 80</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5846A8] rounded-full" style={{ width: "58%" }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartGeneration}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToCompose}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Add to Compose</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
