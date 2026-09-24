"use client";

import React, { useState } from "react";
import { Sparkles, Send, Copy, Check, Bot, RefreshCw, Clock, Hash, Wand2, X, MessageSquare, Paperclip, ChevronRight } from "lucide-react";
import { aiService } from "@/lib/services";
import { useToast } from "@/components/ui/toast";

interface PulseAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToComposer?: (text: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actions?: { label: string; textToInsert: string }[];
}

export function PulseAIPanel({ isOpen, onClose, onInsertToComposer }: PulseAIPanelProps) {
  const { toast } = useToast();

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedTone, setSelectedTone] = useState("Engaging");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "ai",
      text: "Hello! I'm PulseAI, your intelligent social growth assistant. Ask me to draft high-converting captions, viral hashtags, rewrite existing copy, or optimize posting schedules.",
      timestamp: "Just now",
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: "✨ Viral Caption", prompt: "Write an engaging, high-hook Instagram caption for a product launch." },
    { label: "#️⃣ 15 Hashtags", prompt: "Generate 15 high-reach, non-spam hashtags for digital marketing." },
    { label: "🕒 Best Times", prompt: "What are the peak posting times this week for maximum engagement?" },
    { label: "🔄 Repurpose Thread", prompt: "Turn a key insight into a 3-bullet micro thread for X / Twitter." },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: prompt,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsGenerating(true);

    try {
      let aiResponse = "";
      if (prompt.toLowerCase().includes("hashtag")) {
        const tags = await aiService.generateHashtags(prompt, 12);
        aiResponse = tags.join(" ");
      } else if (prompt.toLowerCase().includes("time") || prompt.toLowerCase().includes("schedule")) {
        const times = await aiService.suggestBestTimes(selectedPlatform);
        aiResponse = `Here are your recommended high-engagement posting slots for ${selectedPlatform}:\n\n` +
          times.map((t) => `• ${t.day} at ${t.time} — ${t.reason}`).join("\n");
      } else {
        aiResponse = await aiService.generateCaption(prompt, selectedPlatform, selectedTone);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: "Just now",
        actions: onInsertToComposer
          ? [{ label: "Insert to Composer", textToInsert: aiResponse }]
          : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast({
        title: "AI Generation Error",
        message: "Failed to generate AI response. Please try again.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied to Clipboard",
      message: "AI text ready to paste.",
      type: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 text-white border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            {/* Animated Pulse Orb */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">PulseAI</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Your intelligent social media assistant.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close PulseAI"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform & Tone Pickers */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Platform:</span>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Tone:</span>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Engaging">Engaging</option>
              <option value="Professional">Professional</option>
              <option value="Humorous">Humorous</option>
              <option value="Thought Leadership">Thought Leadership</option>
              <option value="Urgent / Sale">Urgent / Sale</option>
            </select>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* AI Message Action Buttons */}
                {msg.sender === "ai" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onInsertToComposer && (
                      <button
                        type="button"
                        onClick={() => {
                          onInsertToComposer(msg.text);
                          toast({
                            title: "Inserted to Composer",
                            message: "Post copy updated with AI content.",
                            type: "success",
                          });
                        }}
                        className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition ml-auto"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Insert to Composer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-indigo-300 max-w-xs animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>PulseAI is crafting your response...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 whitespace-nowrap transition"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask PulseAI to write, rewrite, or brainstorm..."
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition cursor-pointer"
              title="Send to PulseAI"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PulseAIPanel;
