"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
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
  Image as ImageIcon,
  PenTool,
  Wand2,
  Download,
  Layers,
  Upload,
  Lightbulb,
  Edit3,
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
    imageUrl?: string;
  }) => void;
}

const TONES = [
  "Engaging & Viral",
  "Professional",
  "Educational",
  "Friendly",
  "Bold",
  "Inspirational",
  "Storytelling",
  "Promotional",
  "Minimal",
  "Luxury",
  "Funny",
  "Thought Leadership",
];

const PLATFORMS = [
  { id: "general", label: "Universal (All Channels)" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X (Twitter)" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
  { id: "threads", label: "Threads" },
];

const TEXT_MODELS = [
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", desc: "Instant micro-copy & hashtags (Fastest · 600ms)" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", desc: "Next-gen multimodal reasoning & copy" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", desc: "Flagship intelligence & deep creativity" },
  { id: "gemini-flash-latest", name: "Gemini Flash Production", desc: "Real-time production social copy" },
];

const IMAGE_MODELS = [
  { id: "gemini-3.1-flash-image", name: "Nano Banana 2", desc: "Fast, photorealistic commercial product visuals" },
  { id: "gemini-3-pro-image", name: "Nano Banana Pro", desc: "Studio 8K fidelity & rich scene composition" },
  { id: "gemini-3.1-flash-lite-image", name: "Nano Banana 2 Lite", desc: "Rapid social graphics & story mockups" },
];

const IMAGE_STYLES = [
  { id: "realistic", label: "Commercial Realism", icon: "📸" },
  { id: "cinematic", label: "Cinematic 8K", icon: "🎬" },
  { id: "neon", label: "Cyberpunk & Neon", icon: "⚡" },
  { id: "3d", label: "3D Octane Render", icon: "🧊" },
  { id: "anime", label: "Anime / Digital Art", icon: "🌸" },
  { id: "minimalist", label: "Minimalist Studio", icon: "🌿" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "Square 1:1", desc: "Instagram & Facebook feed" },
  { id: "4:5", label: "Portrait 4:5", desc: "Carousel / Vertical feed" },
  { id: "9:16", label: "Story 9:16", desc: "Reels, Stories & TikTok" },
  { id: "16:9", label: "Landscape 16:9", desc: "LinkedIn & X banner" },
  { id: "2:3", label: "Pin 2:3", desc: "Pinterest Pin" },
];

export function GeminiAiModal({
  isOpen,
  onClose,
  brandName,
  industry = "Digital Marketing",
  onApply,
}: GeminiAiModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"copy" | "image">("copy");

  // Copy state
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Engaging & Viral");
  const [selectedPlatform, setSelectedPlatform] = useState("general");
  const [selectedTextModel, setSelectedTextModel] = useState("gemini-3.1-flash-lite");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeFirstComment, setIncludeFirstComment] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isGenerating, setIsGenerating] = useState(false);

  // Result state
  const [generatedData, setGeneratedData] = useState<{
    primaryCaption: string;
    hashtags: string[];
    firstComment?: string;
    cta?: string;
    alternatives: string[];
    universalVariants?: Record<string, string>;
    suggestions?: string[];
    imagePrompt?: string;
    model?: string;
    createdAt?: string;
  } | null>(null);

  const [activeAltIndex, setActiveAltIndex] = useState<number>(-1); // -1 = primary
  const [activeUniversalTab, setActiveUniversalTab] = useState<string>("instagram");

  // Image state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageAspect, setImageAspect] = useState("1:1");
  const [imageModel, setImageModel] = useState("gemini-3.1-flash-image");
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(true);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);

  // Copy notification states
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedFirstComment, setCopiedFirstComment] = useState(false);

  // Current active caption displayed
  const currentCaption =
    activeAltIndex === -1
      ? (selectedPlatform === "general" && generatedData?.universalVariants?.[activeUniversalTab])
        ? generatedData.universalVariants[activeUniversalTab]
        : generatedData?.primaryCaption || ""
      : generatedData?.alternatives[activeAltIndex] || generatedData?.primaryCaption || "";

  // 1. Generate Copy using Real Gemini API
  const handleGenerateCopy = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Needed",
        message: "Please describe what topic or announcement you'd like Gemini to generate.",
        type: "warning",
      });
      return;
    }

    setIsGenerating(true);
    setActiveAltIndex(-1);
    try {
      const res = await fetch("/api/ai/gemini/social-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          brandName,
          industry,
          tone: selectedTone,
          platform: selectedPlatform,
          model: selectedTextModel,
          includeHashtags,
          includeFirstComment,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gemini generation failed.");
      }

      setGeneratedData({
        primaryCaption: data.primaryCaption,
        hashtags: data.hashtags || [],
        firstComment: data.firstComment,
        cta: data.cta,
        alternatives: data.alternatives || [],
        universalVariants: data.universalVariants,
        suggestions: data.suggestions || [],
        imagePrompt: data.imagePrompt,
        model: data.model,
        createdAt: data.createdAt,
      });

      toast({
        title: "Content Generated!",
        message: `Successfully crafted with ${data.model || "Gemini 3.8 Flash"}.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Gemini AI Error",
        message: err.message || "Gemini could not generate this content. Please try again.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Enhance Prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Prompt Needed",
        message: "Enter an image concept first to enhance it.",
        type: "warning",
      });
      return;
    }

    setIsEnhancingPrompt(true);
    try {
      const res = await fetch("/api/ai/gemini/prompt-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style: imageStyle,
          aspectRatio: imageAspect,
          brandName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Enhancement failed.");
      }

      setImagePrompt(data.enhancedPrompt);
      toast({
        title: "Prompt Enhanced!",
        message: "Gemini expanded your concept with cinematic detail.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Enhancer Error",
        message: err.message || "Failed to enhance prompt.",
        type: "error",
      });
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // 3. Generate Real Image using Gemini Nano Banana
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Image Prompt Needed",
        message: "Please describe the visual you want to create.",
        type: "warning",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/ai/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style: imageStyle,
          aspectRatio: imageAspect,
          model: imageModel,
          enhance: enhanceWithGemini,
          brandName,
          referenceImageBase64: referenceImageBase64 || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Image generation failed.");
      }

      setGeneratedImageUrl(data.imageUrl);
      toast({
        title: "Visual Generated!",
        message: `Rendered with ${data.model} in ${data.aspectRatio}.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Image Generation Error",
        message: err.message || "Failed to generate image with Gemini.",
        type: "error",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. Handle Reference Image File Upload
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        message: "Reference image must be under 5MB.",
        type: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImageBase64(reader.result as string);
      toast({
        title: "Reference Attached",
        message: "Gemini will use this image as visual guidance.",
        type: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  // 5. Generate Image From Current Copy
  const handleGenerateImageFromCopy = () => {
    const visualConcept =
      generatedData?.imagePrompt ||
      `Commercial advertising visual representing: ${prompt || currentCaption.slice(0, 150)}`;
    setImagePrompt(visualConcept);
    setActiveTab("image");
    toast({
      title: "Visual Concept Transferred",
      message: "Ready to render with Gemini Nano Banana.",
      type: "info",
    });
  };

  // 6. Generate Caption from Image
  const handleGenerateCaptionFromImage = async () => {
    if (!generatedImageUrl) return;

    setActiveTab("copy");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/gemini/image-to-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: generatedImageUrl,
          platform: selectedPlatform,
          tone: selectedTone,
          brandName,
          industry,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Vision analysis failed.");
      }

      setGeneratedData({
        primaryCaption: data.primaryCaption,
        hashtags: data.hashtags || [],
        firstComment: data.firstComment,
        cta: data.cta,
        alternatives: data.alternatives || [],
        model: data.model,
        createdAt: data.createdAt,
      });

      toast({
        title: "Vision Copy Generated!",
        message: "Gemini analyzed your visual and wrote tailored social copy.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Vision Analysis Error",
        message: err.message || "Failed to analyze image.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 7. Apply to Post Composer
  const handleApplyToPost = () => {
    onApply({
      caption: currentCaption || (imagePrompt ? `✨ ${imagePrompt}` : ""),
      firstComment: generatedData?.firstComment,
      hashtags: generatedData?.hashtags,
      location: `${brandName} Studio`,
      imageUrl: generatedImageUrl || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Gemini AI Studio</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider">
                    Official Models
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Generate viral post captions and photorealistic AI images for {brandName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <span>Hide Studio</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded font-mono">ESC</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Close Studio (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("copy")}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  activeTab === "copy"
                    ? "border-purple-600 text-purple-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Captions & Social Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  activeTab === "image"
                    ? "border-purple-600 text-purple-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>AI Image Generator</span>
                <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[9px] font-bold">
                  Nano Banana
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-purple-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 3.8 Production</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {activeTab === "copy" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Input controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      What do you want to post about?
                    </label>
                    <textarea
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Launching our new summer product collection with 25% early-bird discount..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Model Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {TEXT_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedTextModel(m.id)}
                        className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                          selectedTextModel === m.id
                            ? "border-purple-600 bg-purple-50/50 text-purple-900"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <p className="text-xs font-semibold leading-tight">{m.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Tone & Platform */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        {TONES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Options Checkboxes & Language */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeHashtags}
                          onChange={(e) => setIncludeHashtags(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Add Hashtags</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeFirstComment}
                          onChange={(e) => setIncludeFirstComment(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>First Comment</span>
                      </label>
                    </div>

                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-2 py-0.5 text-[11px] rounded border border-slate-200 bg-white text-slate-700"
                      title="Select Output Language"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCopy}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate with Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right column: Preview & Output */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                  {generatedData ? (
                    <div className="space-y-3">
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Generated Copy</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            ({generatedData.model || selectedTextModel})
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${currentCaption}\n\n${(generatedData.hashtags || []).join(" ")}`
                              );
                              setCopiedCaption(true);
                              setTimeout(() => setCopiedCaption(false), 2000);
                            }}
                            className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Copy caption + hashtags"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedCaption ? "Copied!" : "Copy All"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Universal Channel Tabs (if Universal selected) */}
                      {selectedPlatform === "general" && generatedData.universalVariants && (
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                          {(["instagram", "linkedin", "x", "facebook"] as const).map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => {
                                setActiveAltIndex(-1);
                                setActiveUniversalTab(ch);
                              }}
                              className={`px-2.5 py-1 rounded-md capitalize font-semibold transition cursor-pointer ${
                                activeAltIndex === -1 && activeUniversalTab === ch
                                  ? "bg-purple-600 text-white shadow-xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {ch === "x" ? "X (Twitter)" : ch}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Alternative Variations Chips */}
                      {generatedData.alternatives && generatedData.alternatives.length > 0 && (
                        <div className="flex items-center gap-1 overflow-x-auto text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveAltIndex(-1)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              activeAltIndex === -1
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Primary Hook
                          </button>
                          {generatedData.alternatives.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveAltIndex(idx)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                activeAltIndex === idx
                                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              Variation {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Primary Caption Content */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-2xs">
                        {currentCaption}
                      </div>

                      {/* Hashtags */}
                      {generatedData.hashtags && generatedData.hashtags.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3 text-purple-600" /> Relevant Hashtags:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedData.hashtags.join(" "));
                                setCopiedHashtags(true);
                                setTimeout(() => setCopiedHashtags(false), 2000);
                              }}
                              className="text-purple-600 hover:underline cursor-pointer"
                            >
                              {copiedHashtags ? "Copied!" : "Copy Hashtags"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {generatedData.hashtags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* First Comment */}
                      {generatedData.firstComment && (
                        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-blue-700 block mb-0.5 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" /> Auto-First Comment:
                            </span>
                            <p className="leading-snug">{generatedData.firstComment}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedData.firstComment || "");
                              setCopiedFirstComment(true);
                              setTimeout(() => setCopiedFirstComment(false), 2000);
                            }}
                            className="text-[10px] font-bold text-blue-700 hover:underline shrink-0 cursor-pointer"
                          >
                            {copiedFirstComment ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      )}

                      {/* Visual Prompt Transfer Idea */}
                      <button
                        type="button"
                        onClick={handleGenerateImageFromCopy}
                        className="w-full py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Generate Image From This Copy</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <Wand2 className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">Your AI Copy will appear here</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        Enter a prompt and hit Generate to receive publication-ready hooks and captions from Gemini.
                      </p>
                    </div>
                  )}

                  {generatedData && (
                    <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleGenerateCopy}
                        disabled={isGenerating}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyToPost}
                        className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply to Composer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: AI IMAGE GENERATOR */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Image Prompt & Config */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Describe the visual you want to create:
                      </label>
                      <button
                        type="button"
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancingPrompt || !imagePrompt.trim()}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3 h-3 ${isEnhancingPrompt ? "animate-spin" : ""}`} />
                        <span>{isEnhancingPrompt ? "Enhancing..." : "Enhance Prompt"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. Ultra realistic coffee cup with steam next to MacBook on marble table at golden hour..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Model Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Gemini Image Model
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {IMAGE_MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setImageModel(m.id)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                            imageModel === m.id
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <p className="text-xs leading-tight truncate">{m.name}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Chips */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Visual Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {IMAGE_STYLES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setImageStyle(st.id)}
                          className={`p-2 rounded-lg border text-left transition flex items-center gap-1.5 cursor-pointer ${
                            imageStyle === st.id
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <span className="text-sm">{st.icon}</span>
                          <span className="text-[11px] truncate">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Dimensions & Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ASPECT_RATIOS.slice(0, 3).map((ar) => (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => setImageAspect(ar.id)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                            imageAspect === ar.id
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <p className="text-xs leading-tight">{ar.label}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{ar.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {ASPECT_RATIOS.slice(3).map((ar) => (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => setImageAspect(ar.id)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                            imageAspect === ar.id
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <p className="text-xs leading-tight">{ar.label}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{ar.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload & Prompt Enhancer Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhanceWithGemini}
                        onChange={(e) => setEnhanceWithGemini(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold text-slate-700">Auto-Enhance with Gemini</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleReferenceUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{referenceImageBase64 ? "Change Reference" : "Add Reference"}</span>
                      </button>
                      {referenceImageBase64 && (
                        <button
                          type="button"
                          onClick={() => setReferenceImageBase64(null)}
                          className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                          title="Remove Reference"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering with Gemini Nano Banana...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Generate Image with Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Real Image Canvas */}
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col justify-between items-center relative overflow-hidden min-h-[300px]">
                  {generatedImageUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-between gap-3">
                      <div className="relative w-full flex-1 min-h-[240px] rounded-lg overflow-hidden border border-slate-800 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedImageUrl}
                          alt="AI Generated Social Media Asset"
                          className="w-full h-full object-contain mx-auto"
                        />
                      </div>

                      <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <a
                            href={generatedImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            download="pulsesocial-ai-asset.png"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>

                          <button
                            type="button"
                            onClick={handleGenerateCaptionFromImage}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Generate social copy from this image"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Create Caption</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleApplyToPost}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition cursor-pointer"
                        >
                          <span>Attach to Post</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Visual Canvas Ready</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                        Enter a prompt to generate high-resolution images powered by official Google Gemini Nano Banana models.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
