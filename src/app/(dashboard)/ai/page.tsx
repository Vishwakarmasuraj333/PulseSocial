"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sparkles, Wand2, Hash, Clock, ArrowRight, MessageSquare, Copy, Check, Send } from "lucide-react";
import { aiService } from "@/lib/services";
import { useToast } from "@/components/ui/toast";

export default function AIPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Engaging");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await aiService.generateCaption(topic, platform, tone);
      setGeneratedResult(res);
      toast({
        title: "Content Generated!",
        message: "Your AI optimized caption is ready.",
        type: "success",
      });
    } catch {
      toast({
        title: "Generation Failed",
        message: "Could not generate content. Please try again.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      message: "Text copied to your clipboard.",
      type: "success",
    });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                PulseAI Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[#E08738] dark:text-[#FBBF24] border border-amber-500/20">
                Google Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
              Generate viral captions, multi-platform threads, hashtags, and schedule recommendations complying with official platform regulations.
            </p>
          </div>

          <a
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E08738] to-[#F59E0B] hover:from-[#D97706] hover:to-[#E08738] text-[#0F0F11] font-bold text-xs shadow-md shadow-amber-900/20 transition self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Full Gemini AI Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Generation Controls */}
          <div className="lg:col-span-6 bg-white dark:bg-[#17171A] rounded-2xl border border-slate-200/90 dark:border-white/7 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#E08738]" />
              <span>Prompt & Parameters</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Target Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Instagram", "LinkedIn", "X (Twitter)", "Facebook", "TikTok", "YouTube"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition text-center cursor-pointer ${
                        platform === p
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-[#E08738] text-[#E08738] dark:text-[#FBBF24] font-semibold"
                          : "border-slate-200 dark:border-white/7 text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E08738]"
                >
                  <option value="Engaging">Engaging & Conversational</option>
                  <option value="Professional">Professional & Corporate</option>
                  <option value="Thought Leadership">Thought Leadership / Educational</option>
                  <option value="Humorous">Humorous & Witty</option>
                  <option value="Promotional">Promotional & High Urgency</option>
                </select>
              </div>

              {/* Prompt Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  What is your post about?
                </label>
                <textarea
                  rows={4}
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Announcing our new SaaS AI features, highlighting 30% time saved for marketing managers..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E08738] resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E08738] to-[#F59E0B] hover:from-[#D97706] hover:to-[#E08738] text-[#0F0F11] text-xs font-bold shadow-md shadow-amber-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Generating Content..." : "Generate with PulseAI"}</span>
              </button>
            </form>
          </div>

          {/* Right: AI Output & Live Preview */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50 dark:bg-[#111113] rounded-2xl border border-slate-200 dark:border-white/7 p-6">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-white/7">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  AI Generated Output
                </span>
                {generatedResult && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs font-medium text-[#E08738] hover:text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy text"}</span>
                  </button>
                )}
              </div>

              {generatedResult ? (
                <div className="bg-white dark:bg-[#17171A] p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {generatedResult}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <Sparkles className="w-8 h-8 text-amber-500/40 mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Your AI copy will appear here.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select your platform and click &quot;Generate with PulseAI&quot; to begin.
                  </p>
                </div>
              )}
            </div>

            {/* Quick action: Open Composer */}
            {generatedResult && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/7 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem("pulse_draft", generatedResult);
                    window.location.href = "/compose";
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E08738] to-[#F59E0B] hover:from-[#D97706] hover:to-[#E08738] text-[#0F0F11] font-bold text-xs shadow-md shadow-amber-900/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open in Post Composer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
