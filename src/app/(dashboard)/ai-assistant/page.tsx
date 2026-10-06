"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/toast";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import {
  Sparkles,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  Edit3,
  Hash,
  Image as ImageIcon,
  Key,
  Sliders,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Share2,
  PenTool,
  Download,
  ExternalLink,
  Layers,
  Palette,
  Maximize2,
  ShieldCheck,
  BookOpen,
  Zap,
} from "lucide-react";
import { GeminiIcon } from "@/components/icons/PlatformIcons";
import { PLATFORM_RULES, getPlatformRule, validateContentRules, PlatformRule } from "@/lib/social-rules";

interface Variation {
  id: number;
  label: string;
  hook?: string;
  caption: string;
  hashtags?: string[];
  firstComment?: string;
  validation?: {
    isCompliant: boolean;
    charCount: number;
    maxChars: number;
    charRemaining: number;
    hashtagCount: number;
    maxHashtags: number;
    warnings: string[];
    hookScore: number;
  };
}

const TEXT_MODELS = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "Ultra Fast",
    desc: "Instant real-time responses & high consistency (Fastest)",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "Next-Gen",
    desc: "Advanced multimodal reasoning & creative copy",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Flagship",
    desc: "Next-gen multimodal & deep reasoning",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    badge: "Production",
    desc: "Real-time production social copy & viral hooks",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    badge: "Lite",
    desc: "Instant micro-copy, hashtags & quick ideas",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    badge: "Deep Thinking",
    desc: "Long-form LinkedIn & complex strategic writing",
  },
];

const IMAGE_MODELS = [
  { id: "flux", name: "Flux.1 Pro Realism", desc: "Ultra-high fidelity photorealistic renders" },
  { id: "turbo", name: "SDXL Turbo Fast", desc: "Crisp digital social graphics & illustrations" },
];

const IMAGE_STYLES = [
  { id: "realistic", label: "Commercial 8K", icon: "📸" },
  { id: "cinematic", label: "Cinematic Movie", icon: "🎬" },
  { id: "neon", label: "Cyberpunk Neon", icon: "⚡" },
  { id: "3d", label: "3D Octane Render", icon: "🧊" },
  { id: "anime", label: "Anime / Digital Art", icon: "🌸" },
  { id: "minimalist", label: "Minimalist Studio", icon: "🌿" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", sub: "1080×1080 • Instagram & FB feed" },
  { id: "4:5", label: "4:5 Portrait", sub: "1080×1350 • Instagram Carousel" },
  { id: "9:16", label: "9:16 Vertical", sub: "720×1280 • Reels, Stories & TikTok" },
  { id: "16:9", label: "16:9 Landscape", sub: "1280×720 • LinkedIn & X banner" },
];

const QUICK_INSPIRATIONS = [
  "Lord Hanuman with divine golden aura and cosmic energy",
  "Product launch announcement for productivity SaaS software",
  "Inspiring morning coffee on minimalist oak desk at sunrise",
  "Behind the scenes of creative design studio workflow",
  "Tech conference keynote speaker addressing global audience",
];

const PLATFORMS_LIST = [
  { id: "Instagram", name: "Instagram", ruleKey: "instagram" },
  { id: "X (Twitter)", name: "X (Twitter)", ruleKey: "x" },
  { id: "LinkedIn", name: "LinkedIn", ruleKey: "linkedin" },
  { id: "Facebook", name: "Facebook", ruleKey: "facebook" },
  { id: "TikTok", name: "TikTok", ruleKey: "tiktok" },
  { id: "YouTube", name: "YouTube", ruleKey: "youtube" },
];

export default function GeminiAiStudioPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"text" | "image" | "rules">("text");

  // Text generation state
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Engaging & Viral");
  const [selectedTextModel, setSelectedTextModel] = useState("gemini-3.5-flash");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>("Google Gemini 3.5 Flash");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("Lord Hanuman with divine golden aura and cosmic energy");
  const [selectedImageModel, setSelectedImageModel] = useState("flux");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedAspect, setSelectedAspect] = useState("1:1");
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedMeta, setGeneratedMeta] = useState<any>(null);

  // Composer integration modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialText, setComposerInitialText] = useState("");
  const [composerInitialMedia, setComposerInitialMedia] = useState<string | undefined>(undefined);

  // Custom API key state & verification
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    model?: string;
    latencyMs?: number;
  } | null>(null);

  // Load saved key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("pulsesocial_gemini_key");
      if (savedKey) {
        setCustomKey(savedKey);
      }
    } catch {}
  }, []);

  const activeRule = getPlatformRule(platform);

  const tones = [
    { label: "Engaging & Viral", desc: "High-energy with captivating hook" },
    { label: "Professional", desc: "Structured business & value-first" },
    { label: "Friendly & Casual", desc: "Warm, relatable everyday voice" },
    { label: "Inspirational & Bold", desc: "Empowering, fearless & motivating" },
    { label: "Thought Leadership", desc: "Deep industry insights & lessons" },
  ];

  // Test API key connection
  const handleTestConnection = async () => {
    setIsTestingKey(true);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customApiKey: customKey || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setKeyStatus({
          tested: true,
          ok: true,
          message: data.message,
          model: data.activeModel,
          latencyMs: data.latencyMs,
        });
        toast({
          title: "Gemini Connected!",
          message: `Connected to Google Gemini ${data.activeModel} (${data.latencyMs}ms)`,
          type: "success",
        });
      } else {
        setKeyStatus({
          tested: true,
          ok: false,
          message: data.error || "Connection failed",
        });
        toast({
          title: "Connection Failed",
          message: data.error || "Could not connect to Gemini API",
          type: "error",
        });
      }
    } catch (err: any) {
      setKeyStatus({
        tested: true,
        ok: false,
        message: err.message || "Failed to reach server",
      });
      toast({
        title: "Test Error",
        message: err.message || "Network error",
        type: "error",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = () => {
    try {
      if (customKey.trim()) {
        localStorage.setItem("pulsesocial_gemini_key", customKey.trim());
      } else {
        localStorage.removeItem("pulsesocial_gemini_key");
      }
      toast({
        title: "Key Updated",
        message: "Gemini API key saved to browser memory.",
        type: "success",
      });
      handleTestConnection();
    } catch {}
  };

  // ==========================================
  // Text Copy Generation Handler
  // ==========================================
  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        message: "Please enter a topic or description of your post.",
        type: "warning",
      });
      return;
    }

    setIsGeneratingText(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          platform,
          tone,
          model: selectedTextModel,
          customApiKey: customKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Generation failed");
      }

      const allVariations = data.variations || data.result?.variations;
      if (allVariations && Array.isArray(allVariations) && allVariations.length > 0) {
        setVariations(
          allVariations.map((v: any) => ({
            ...v,
            validation: validateContentRules(v.caption || "", platform, v.hashtags || []),
          }))
        );
      } else if (data.result?.caption || data.primaryCaption) {
        const caption = data.result?.caption || data.primaryCaption || "";
        const hashtags = data.result?.hashtags || data.hashtags || [];
        setVariations([
          {
            id: 1,
            label: "Generated Output",
            hook: data.result?.hook || caption.split("\n")[0],
            caption,
            hashtags,
            firstComment: data.result?.firstComment || data.firstComment,
            validation: validateContentRules(caption, platform, hashtags),
          },
        ]);
      }

      setActiveProvider(data.provider || `Google Gemini (${data.model})`);

      toast({
        title: "Content Generated!",
        message: `Compliant with ${platform} rules via ${data.provider || data.model}.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Generation Request Error",
        message: err.message || "Failed to generate AI response.",
        type: "error",
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  // ==========================================
  // Image Generation Handler
  // ==========================================
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Image Prompt Required",
        message: "Please describe what image you want to generate.",
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
          style: selectedStyle,
          aspectRatio: selectedAspect,
          model: selectedImageModel,
          enhance: enhanceWithGemini,
          customApiKey: customKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImageUrl(data.imageUrl);
      setGeneratedMeta(data);

      toast({
        title: "AI Visual Rendered!",
        message: `Rendered with ${data.generator || "Flux.1 Pro"} in ${data.aspectRatio}.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Image Error",
        message: err.message || "Failed to generate image. Please try again.",
        type: "error",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", message: "Text copied to clipboard", type: "success" });
  };

  const handleAddToComposer = (caption: string, hashtags?: string[], imageUrl?: string) => {
    const fullText = hashtags && hashtags.length > 0 ? `${caption}\n\n${hashtags.join(" ")}` : caption;
    setComposerInitialText(fullText);
    setComposerInitialMedia(imageUrl || undefined);
    setIsComposerOpen(true);
  };

  const handleSaveEdit = (id: number) => {
    setVariations((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              caption: editedText,
              validation: validateContentRules(editedText, platform, v.hashtags),
            }
          : v
      )
    );
    setEditingId(null);
    toast({ title: "Updated", message: "Variation edited & re-validated successfully", type: "info" });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Google Gemini AI Studio
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Gemini 3.8 Flash Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full-stack social content generation strictly complying with platform rules, character caps, and Flux.1 Pro visuals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>{showKeyInput ? "Hide API Key Settings" : "Configure Gemini API Key"}</span>
            </button>
          </div>
        </div>

        {/* API Key Configuration Dropdown */}
        {showKeyInput && (
          <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-600" /> Google Gemini API Key Configuration
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  PulseSocial uses the active server key in <code>.env</code> by default. You can override it with your own key below.
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-700 font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Get API key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy... (or keep blank to use server environment key)"
                className="flex-1 text-xs p-2.5 rounded-xl border border-purple-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingKey}
                className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Connection</span>
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
              >
                Save & Apply
              </button>
            </div>

            {keyStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  keyStatus.ok
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {keyStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{keyStatus.message}</span>
                {keyStatus.latencyMs && (
                  <span className="ml-auto font-mono text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    {keyStatus.latencyMs}ms
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 max-w-lg">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "text"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-purple-600" />
            <span>Captions & Variations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "image"
                ? "bg-white text-pink-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
            <span>AI Image Studio</span>
            <span className="px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 text-[9px] font-bold">
              Flux.1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "rules"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Platform Rules</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: CAPTIONS & MULTI-VARIATION TEXT STUDIO                */}
        {/* ============================================================ */}
        {activeTab === "text" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    What is your post about?
                  </label>
                  <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Target: {activeRule.name}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Announcing our 2026 digital product release with early bird access..."
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition resize-none leading-relaxed"
                />
              </div>

              {/* Model Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Google Gemini Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEXT_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedTextModel(m.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedTextModel === m.id
                          ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold truncate">{m.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full shrink-0">
                          {m.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight line-clamp-2">
                        {m.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platform */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Target Platform & Rules
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Cap: <strong>{activeRule.maxChars} chars</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS_LIST.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center truncate ${
                        platform === p.id
                          ? "border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Quick Rule Pill */}
                <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Max {activeRule.maxHashtags} hashtags • Hook &lt; {activeRule.idealHookLength} chars</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("rules")}
                    className="text-purple-600 font-semibold hover:underline text-[10px]"
                  >
                    View regulations
                  </button>
                </div>
              </div>

              {/* Tone of Voice */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Tone of Voice
                </label>
                <div className="space-y-1.5">
                  {tones.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTone(t.label)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border text-left flex items-center justify-between transition ${
                        tone === t.label
                          ? "border-purple-600 bg-purple-50 text-purple-900 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateText}
                disabled={isGeneratingText || !prompt.trim()}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingText ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating with Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Compliant Content</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Variations (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {variations.length > 0 ? (
                <>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                      <GeminiIcon size={16} />
                      <span>Generated using: <strong>{activeProvider}</strong></span>
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium">
                      All variations strictly comply with {activeRule.name} rules
                    </span>
                  </div>

                  {variations.map((v) => {
                    const validation = v.validation || validateContentRules(v.caption, platform, v.hashtags);
                    return (
                      <div
                        key={v.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative group hover:border-purple-300 transition"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                              {v.label || `Variation ${v.id}`}
                            </span>
                            {/* Compliance Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                validation.isCompliant
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {validation.charCount} / {validation.maxChars} chars
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                              Hook Score: {validation.hookScore}/100
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (editingId === v.id) {
                                  handleSaveEdit(v.id);
                                } else {
                                  setEditingId(v.id);
                                  setEditedText(v.caption);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{editingId === v.id ? "Save" : "Edit"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(v.id, v.caption)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1 transition"
                            >
                              {copiedId === v.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Hook */}
                        {v.hook && (
                          <div className="text-xs font-semibold text-purple-700 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                            <span className="text-[10px] uppercase tracking-wider text-purple-500 block mb-0.5">
                              Opening Hook ({v.hook.length} chars):
                            </span>
                            &ldquo;{v.hook}&rdquo;
                          </div>
                        )}

                        {/* Caption Text / Editor */}
                        {editingId === v.id ? (
                          <textarea
                            rows={6}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-purple-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-sans leading-relaxed"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {v.caption}
                          </p>
                        )}

                        {/* Hashtags */}
                        {v.hashtags && v.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {v.hashtags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 transition cursor-pointer"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Strategic First Comment */}
                        {v.firstComment && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                            <strong className="text-slate-700">Recommended 1st Comment:</strong>{" "}
                            {v.firstComment}
                          </div>
                        )}

                        {/* Card Bottom Actions */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            Strict {activeRule.name} Regulation Standard
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAddToComposer(v.caption, v.hashtags)}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Add to Composer</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Gemini 3.8 Flash Engine Ready
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Enter a topic on the left to generate 3 multi-platform variations tailored to the strict rules and character limits of {activeRule.name}.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      ✓ 280-char X hard cap
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      ✓ Instagram 1st comment tags
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      ✓ LinkedIn whitespace formatting
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: AI IMAGE STUDIO (PHOTOREALISTIC GENERATOR)            */}
        {/* ============================================================ */}
        {activeTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Describe your image in detail
                  </label>
                  <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    Flux.1 Pro + Gemini Enhancer
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. Lord Hanuman with divine golden aura, majestic temple in background, cinematic volumetric lighting..."
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition resize-none leading-relaxed"
                />

                {/* Quick Inspiration Chips */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                    Quick Prompt Ideas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_INSPIRATIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImagePrompt(chip)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-50 hover:bg-pink-50 hover:text-pink-700 text-slate-600 border border-slate-200/60 transition truncate max-w-[200px]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Engine */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Image Generator Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedImageModel(m.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedImageModel === m.id
                          ? "border-pink-500 bg-pink-50/60 text-pink-900 ring-1 ring-pink-500 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        {m.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Visual Aesthetic / Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyle(st.id)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        selectedStyle === st.id
                          ? "border-pink-500 bg-pink-50 text-pink-900 font-bold shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <span className="text-base">{st.icon}</span>
                      <span className="text-[10px] leading-tight truncate w-full">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Aspect Ratio & Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setSelectedAspect(ar.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedAspect === ar.id
                          ? "border-pink-500 bg-pink-50 text-pink-900 font-bold shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <span className="text-xs block font-bold">{ar.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{ar.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Prompt Enhancer Toggle */}
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GeminiIcon size={16} />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      Gemini 3.8 Prompt Enhancer
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Enriches prompts into photorealistic 8K cinema specs
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enhanceWithGemini}
                  onChange={(e) => setEnhanceWithGemini(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-sm cursor-pointer"
                />
              </div>

              {/* Generate Image Button */}
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Visual Asset with Flux.1...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Render Ultra-HD Social Visual</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Image Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 min-h-[560px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
              {generatedImageUrl ? (
                <div className="w-full space-y-4">
                  <div className="relative w-full max-h-[520px] rounded-xl overflow-hidden bg-black flex items-center justify-center group shadow-2xl">
                    <img
                      src={generatedImageUrl}
                      alt={imagePrompt}
                      className="w-full h-auto max-h-[520px] object-contain rounded-xl"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Open Fullscreen</span>
                      </a>
                    </div>
                  </div>

                  {/* Image Metadata & Quick Export */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <strong>{generatedMeta?.generator || "Flux.1 Pro Photoreal"}</strong>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {generatedMeta?.dimensions?.width}×{generatedMeta?.dimensions?.height} • Seed: {generatedMeta?.seed}
                      </span>
                    </div>

                    {generatedMeta?.enhancedPrompt && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-purple-400 not-italic">Gemini Enhanced Prompt:</strong> &ldquo;{generatedMeta.enhancedPrompt}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        download="pulsesocial-asset.jpg"
                        className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Asset</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToComposer(
                            `✨ ${imagePrompt}\n\n#VisualStorytelling #PulseSocial #AIArt`,
                            ["#Trending", "#Innovation"],
                            generatedImageUrl
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/30 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Add to Post Composer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-pink-400 mb-4 shadow-inner">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200">
                    Real AI Visual Studio Ready
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                    Enter your image idea on the left and select your style to render photorealistic imagery powered by Flux.1 Pro and Gemini 3.8 Flash.
                  </p>
                  <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Flux.1 Pro Realism
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 8K Ultra-HD
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Click Composer Export
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PLATFORM RULES & REGULATIONS HUB                      */}
        {/* ============================================================ */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-indigo-900">
                  Global Social Media Regulations & Publishing Standards
                </h3>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Every social network enforces strict character caps, hashtag quotas, hook truncation thresholds, and formatting algorithms. PulseSocial&apos;s Gemini 3.8 Flash engine automatically validates every piece of generated content against these official guidelines.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(PLATFORM_RULES).map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-indigo-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {rule.maxChars.toLocaleString()} chars cap
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Recommended Length:</span>
                        <strong className="text-slate-800">{rule.recommendedMaxChars} chars</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Max Hashtags:</span>
                        <strong className="text-slate-800">{rule.maxHashtags} tags</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Hashtag Placement:</span>
                        <strong className="text-slate-800 capitalize">{rule.hashtagPlacement.replace("_", " ")}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Hook Truncation:</span>
                        <strong className="text-slate-800">&lt; {rule.idealHookLength} chars</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Key Rules:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside leading-tight">
                        {rule.rules.slice(0, 3).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPlatform(rule.name);
                      setActiveTab("text");
                    }}
                    className="w-full mt-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold border border-slate-200 hover:border-indigo-200 transition"
                  >
                    Generate for {rule.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Composer Modal Integration */}
        {isComposerOpen && (
          <PostComposerModal
            isOpen={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
            initialContent={composerInitialText}
            initialMediaUrl={composerInitialMedia}
          />
        )}
      </div>
    </AppLayout>
  );
}
