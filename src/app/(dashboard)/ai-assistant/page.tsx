"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Copy, Check, Send, Wand2 } from "lucide-react";

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const sampleCaptions: Record<string, string> = {
        Professional: `We are thrilled to unveil our latest innovation designed to streamline your social media fleet. By connecting multi-network channels into a unified orchestration layer, your team saves hours while amplifying audience engagement.\n\nLearn more about our methodology and join the beta today.\n\n#EnterpriseTech #DigitalTransformation #Innovation`,
        Witty: `Managing 5 different social networks with 15 open browser tabs? 😅 Yeah, we decided that was madness. Say hello to zero-tab chaos and effortless multi-channel publishing.\n\nYour sanity will thank you. 🚀\n\n#TechHumor #WorkSmart #SocialMediaWin`,
        Engaging: `What's the #1 bottleneck holding your content workflow back this quarter? Consistency, multi-network adaptation, or cross-platform analytics? Drop your thoughts below—we're sharing our playbook with everyone who comments! 👇\n\n#ContentStrategy #MarketingCommunity`,
      };

      setGeneratedCaption(sampleCaptions[tone] || sampleCaptions.Professional);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopied(true);
    toast({ title: "Copied", message: "Caption copied to clipboard", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" /> AI Social Copilot
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate high-converting copy, hashtags, and tone-optimized captions for any platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt inputs */}
          <Card className="lg:col-span-5 p-5 space-y-4">
            <CardTitle className="text-base">Campaign Prompt</CardTitle>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">What is your post about?</label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Announcing our new product feature, expanding to Europe, hiring 10 designers..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Desired Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {["Professional", "Witty", "Engaging"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      tone === t
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
            >
              <Wand2 className="w-4 h-4 mr-1.5" /> Generate Variations
            </Button>
          </Card>

          {/* Generated Result */}
          <Card className="lg:col-span-7 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base">AI Generated Draft</CardTitle>
                {generatedCaption && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="py-4 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line min-h-[160px]">
                {generatedCaption || (
                  <span className="text-slate-400 italic text-xs">
                    Fill in your prompt and click Generate to produce optimized captions...
                  </span>
                )}
              </div>
            </div>

            {generatedCaption && (
              <Button
                onClick={() => (window.location.href = "/posts/new")}
                className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl mt-4"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Open in Post Composer
              </Button>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
