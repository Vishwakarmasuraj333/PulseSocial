"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import {
  Sparkles,
  Copy,
  Check,
  Send,
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
  Share2,
} from "lucide-react";
import { GeminiIcon } from "@/components/icons/PlatformIcons";

interface Variation {
  id: number;
  label: string;
  hook?: string;
  caption: string;
  hashtags?: string[];
  firstComment?: string;
}

export default function GeminiAiStudioPage() {
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Engaging & Viral");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<"variations" | "shorten" | "expand" | "rewrite" | "hashtags" | "image_prompt">("variations");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialText, setComposerInitialText] = useState("");
  const [apiKeyNotice, setApiKeyNotice] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const tones = [
    { label: "Engaging & Viral", desc: "High-energy with hook" },
    { label: "Professional", desc: "Value-first & structured" },
    { label: "Friendly & Casual", desc: "Warm & relatable" },
    { label: "Marketing Tone", desc: "Clear call-to-action" },
    { label: "Thought Leadership", desc: "Insightful industry angle" },
  ];

  const platforms = ["Instagram", "LinkedIn", "X (Twitter)", "Facebook", "TikTok", "YouTube"];

  const handleGenerate = async (actionToUse = activeAction) => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        message: "Please enter a topic or description of your post.",
        type: "error",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform,
          tone,
          action: actionToUse,
          customApiKey: customKey || undefined,
        }),
      });

      const data = await res.json();

      if (data.notice) {
        setApiKeyNotice(data.notice);
      } else {
        setApiKeyNotice(null);
      }

      if (data.result?.variations && Array.isArray(data.result.variations)) {
        setVariations(data.result.variations);
      } else if (data.result?.caption) {
        setVariations([
          {
            id: 1,
            label: "Generated Output",
            hook: data.result.hook,
            caption: data.result.caption,
            hashtags: data.result.hashtags,
            firstComment: data.result.firstComment,
          },
        ]);
      }

      toast({
        title: "Content Generated!",
        message: "Gemini AI generated content variations for review.",
        type: "success",
      });
    } catch {
      toast({
        title: "Generation Request Error",
        message: "Failed to generate AI response. Please check your network.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", message: "Text copied to clipboard", type: "success" });
  };

  const handleAddToComposer = (caption: string, hashtags?: string[]) => {
    const fullText = hashtags && hashtags.length > 0
      ? `${caption}\n\n${hashtags.join(" ")}`
      : caption;
    setComposerInitialText(fullText);
    setIsComposerOpen(true);
  };

  const handleSaveEdit = (id: number) => {
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, caption: editedText } : v))
    );
    setEditingId(null);
    toast({ title: "Updated", message: "Variation edited successfully", type: "info" });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create with Gemini AI
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                Gemini 1.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authoritative multi-variation copy, tone adjustments, hashtag recommendations, and viral hooks powered by Google Gemini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto"
          >
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            <span>{showKeyInput ? "Hide API Key" : "Configure Gemini API Key"}</span>
          </button>
        </div>

        {/* API Key Configuration Dropdown */}
        {showKeyInput && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Custom Google Gemini API Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Get a free key from Google AI Studio &rarr;
              </a>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Keys are passed securely to your backend API route and never exposed on client-side bundles. You can also save it in your project's <code>.env</code> file as <code>GEMINI_API_KEY</code>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  toast({ title: "Key Applied", message: "Custom Gemini API key active for this session.", type: "success" });
                  setShowKeyInput(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
              >
                Apply Key
              </button>
            </div>
          </div>
        )}

        {/* Informational banner if offline mode */}
        {apiKeyNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{apiKeyNotice}</span>
            </div>
            <button
              onClick={() => setShowKeyInput(true)}
              className="text-xs font-bold text-amber-900 dark:text-amber-100 underline hover:opacity-80 shrink-0 ml-3"
            >
              Add Key Now
            </button>
          </div>
        )}

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                What is your post about?
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Announcing our summer feature drop with multi-platform analytics, 3x faster scheduling, and live preview..."
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
              />
            </div>

            {/* Platform Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                      platform === p
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Tone */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Tone of Voice
              </label>
              <div className="space-y-1">
                {tones.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTone(t.label)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition ${
                      tone === t.label
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Tools */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Generation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("variations");
                    handleGenerate("variations");
                  }}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>3 Variations</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("shorten");
                    handleGenerate("shorten");
                  }}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Shorten Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("expand");
                    handleGenerate("expand");
                  }}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Expand & Elaborate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("hashtags");
                    handleGenerate("hashtags");
                  }}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  <Hash className="w-3.5 h-3.5 text-pink-500" />
                  <span>Hashtag Suite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Variations & Output Review */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Generated Content Review</span>
                {variations.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {variations.length} {variations.length === 1 ? "Option" : "Options"}
                  </span>
                )}
              </h2>
              {variations.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>Regenerate All</span>
                </button>
              )}
            </div>

            {/* Empty State */}
            {variations.length === 0 && !isGenerating && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ready to generate high-converting copy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Enter your topic, choose your target platform and tone, and click <strong>3 Variations</strong> to let Gemini AI generate tailored options.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("Announcing our new summer release with automated multi-channel calendar scheduling and analytics!");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
                  >
                    💡 Try Product Announcement Example
                  </button>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isGenerating && (
              <div className="space-y-4">
                {[1, 2].map((s) => (
                  <div key={s} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Generated Variations List */}
            {variations.length > 0 && !isGenerating && (
              <div className="space-y-4">
                {variations.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {v.label}
                      </span>
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
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                          title="Edit Caption"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{editingId === v.id ? "Save" : "Edit"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(v.id, v.caption)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                          title="Copy text"
                        >
                          {copiedId === v.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600">Copied</span>
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

                    {/* Hook if present */}
                    {v.hook && (
                      <p className="text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        🎯 Hook: {v.hook}
                      </p>
                    )}

                    {/* Caption / Editable View */}
                    {editingId === v.id ? (
                      <textarea
                        rows={5}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-slate-950 focus:outline-hidden"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {v.caption}
                      </p>
                    )}

                    {/* Hashtags */}
                    {v.hashtags && v.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {v.hashtags.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* First Comment Suggestion */}
                    {v.firstComment && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                        💬 Suggested First Comment: {v.firstComment}
                      </p>
                    )}

                    {/* Action: Use in Post Composer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddToComposer(v.caption, v.hashtags)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition active:scale-[0.98]"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Add to Composer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Post Composer Modal */}
        <PostComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
