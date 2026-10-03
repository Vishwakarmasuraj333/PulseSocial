"use client";

import React, { useState } from "react";
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
  Sliders,
  ExternalLink,
  Key,
  Image as ImageIcon,
  PenTool,
  Wand2,
  Download,
  Layers,
  Ratio,
  Palette,
  Eye,
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
  "Professional & Corporate",
  "Casual & Friendly",
  "Inspirational & Bold",
  "Thought Leadership",
  "Urgent Announcement",
];

const TEXT_MODELS = [
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", desc: "Flagship, ultra-fast & intelligent" },
  { id: "gemini-flash-latest", name: "Gemini Flash Latest", desc: "Real-time production copy" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", desc: "Balanced consistency" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", desc: "Deep reasoning & long-form" },
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
  { id: "9:16", label: "Story 9:16", desc: "Reels & Stories" },
  { id: "16:9", label: "Landscape 16:9", desc: "LinkedIn & X banner" },
];

export function GeminiAiModal({
  isOpen,
  onClose,
  brandName,
  industry = "Digital Marketing",
  onApply,
}: GeminiAiModalProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"copy" | "image">("copy");

  // Copy state
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Engaging & Viral");
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedTextModel, setSelectedTextModel] = useState("gemini-3.8-flash");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);
  const [includeFirstComment, setIncludeFirstComment] = useState(true);

  // Image state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageAspect, setImageAspect] = useState("1:1");
  const [imageModel, setImageModel] = useState("flux");
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(true);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Custom API key state from localStorage or .env
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("pulsesocial_gemini_key");
      if (saved) setApiKeyInput(saved);
    } catch {}
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    hook: string;
    caption: string;
    hashtags: string[];
    firstComment?: string;
    suggestedLocation?: string;
  } | null>(null);

  const [copiedCaption, setCopiedCaption] = useState(false);

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
          model: selectedTextModel,
          includeHashtags,
          includeCta,
          includeFirstComment,
          customApiKey: apiKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Generation failed");
      }

      setGeneratedData(data.result);
      toast({
        title: "Content Generated!",
        message: `Generated using ${data.model || "Gemini AI"}.`,
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Image Prompt Needed",
        message: "Please describe the image you want to generate.",
        type: "warning",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style: imageStyle,
          aspectRatio: imageAspect,
          model: imageModel,
          enhance: enhanceWithGemini,
          customApiKey: apiKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImageUrl(data.imageUrl);
      toast({
        title: "Image Generated!",
        message: `High-resolution visual ready in ${data.aspectRatio}.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Image Generation Error",
        message: err.message || "Failed to generate image.",
        type: "error",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleApplyToPost = () => {
    onApply({
      caption: generatedData?.caption || (imagePrompt ? `✨ ${imagePrompt}` : ""),
      firstComment: generatedData?.firstComment,
      hashtags: generatedData?.hashtags,
      location: generatedData?.suggestedLocation,
      imageUrl: generatedImageUrl || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
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
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                title="Configure Gemini API Key"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
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
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
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
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === "image"
                    ? "border-purple-600 text-purple-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>AI Image Generator</span>
                <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[9px] font-bold">
                  NEW
                </span>
              </button>
            </div>
          </div>

          {/* Optional API key input banner */}
          {showKeyInput && (
            <div className="px-6 py-2.5 bg-purple-50/70 border-b border-purple-100 flex items-center gap-3 text-xs">
              <Key className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Custom Google Gemini API Key (or blank for server .env)"
                className="flex-1 px-2.5 py-1 text-xs rounded border border-purple-200 bg-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    if (apiKeyInput.trim()) {
                      localStorage.setItem("pulsesocial_gemini_key", apiKeyInput.trim());
                    } else {
                      localStorage.removeItem("pulsesocial_gemini_key");
                    }
                    toast({ title: "Key Saved", message: "Saved to browser memory.", type: "success" });
                  } catch {}
                }}
                className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded text-[11px] hover:bg-purple-700 transition"
              >
                Save
              </button>
              <span className="text-[11px] text-purple-700 font-medium">Gemini 3.8 Ready</span>
            </div>
          )}

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
                        className={`p-2 rounded-lg border text-left transition ${
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
                        <option value="general">Universal (All Channels)</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="x">X (Twitter)</option>
                        <option value="facebook">Facebook</option>
                      </select>
                    </div>
                  </div>

                  {/* Options Checkboxes */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
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

                  <button
                    type="button"
                    onClick={handleGenerateCopy}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Crafting viral copy...</span>
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
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Generated Social Copy
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${generatedData.caption}\n\n${(generatedData.hashtags || []).join(" ")}`
                            );
                            setCopiedCaption(true);
                            setTimeout(() => setCopiedCaption(false), 2000);
                          }}
                          className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedCaption ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                        {generatedData.caption}
                      </div>

                      {generatedData.hashtags && generatedData.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {generatedData.hashtags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {generatedData.firstComment && (
                        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
                          <span className="font-semibold text-blue-700 block mb-0.5">
                            Auto-First Comment:
                          </span>
                          {generatedData.firstComment}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <Wand2 className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">Your AI Copy will appear here</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        Enter a prompt and hit Generate to receive publication-ready hooks and captions.
                      </p>
                    </div>
                  )}

                  {generatedData && (
                    <div className="pt-3 border-t border-slate-200 mt-3 flex justify-end">
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Describe the visual you want to create:
                    </label>
                    <textarea
                      rows={3}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. Ultra realistic coffee cup with steam next to MacBook on marble table at golden hour..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder:text-slate-400"
                    />
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
                          className={`p-2 rounded-lg border text-left transition flex items-center gap-1.5 ${
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
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map((ar) => (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => setImageAspect(ar.id)}
                          className={`p-2 rounded-lg border text-left transition ${
                            imageAspect === ar.id
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <p className="text-xs leading-tight">{ar.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{ar.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model & Gemini Enhancement */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhanceWithGemini}
                        onChange={(e) => setEnhanceWithGemini(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold text-slate-700">Enhance with Gemini AI</span>
                    </label>
                    <span className="text-[10px] text-purple-600 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                      Flux.1 High-Res
                    </span>
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
                        <span>Rendering realistic visual...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Generate Visual Image</span>
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
                        <a
                          href={generatedImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          download="pulsesocial-ai-asset.jpg"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>

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
                        Enter a prompt to generate high-resolution images powered by Flux.1 and Gemini AI.
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
