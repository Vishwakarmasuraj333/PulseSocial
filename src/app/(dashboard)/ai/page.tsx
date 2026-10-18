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
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 dark:text-[#9CA3AF]">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                PulseAI Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5846A8] border border-purple-200 dark:bg-amber-500/10 dark:text-[#FBBF24] dark:border-amber-500/20">
                Google Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
              Generate viral captions, multi-platform threads, hashtags, and schedule recommendations complying with official platform regulations.
            </p>
          </div>

          <a
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:hover:from-[#D97706] dark:hover:to-[#E08738] dark:text-[#0F0F11] dark:shadow-amber-900/20 font-bold text-xs transition self-start sm:self-auto cursor-pointer"
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
              <Wand2 className="w-4 h-4 text-[#5846A8] dark:text-[#E08738]" />
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
                          ? "bg-purple-50 border-[#5846A8] text-[#5846A8] dark:bg-amber-500/15 dark:border-[#E08738] dark:text-[#FBBF24] font-semibold shadow-xs"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5846A8] focus:border-[#5846A8] dark:focus:ring-[#E08738] dark:focus:border-[#E08738]"
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
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5846A8] focus:border-[#5846A8] dark:focus:ring-[#E08738] dark:focus:border-[#E08738] resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:hover:from-[#D97706] dark:hover:to-[#E08738] dark:text-[#0F0F11] dark:shadow-amber-900/20 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
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
                    className="text-xs font-medium text-[#5846A8] hover:text-[#48388d] dark:text-[#FBBF24] dark:hover:text-[#E08738] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                  <Sparkles className="w-8 h-8 text-[#5846A8]/40 dark:text-amber-500/40 mb-2" />
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
                  className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:hover:from-[#D97706] dark:hover:to-[#E08738] dark:text-[#0F0F11] dark:shadow-amber-900/20 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
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
