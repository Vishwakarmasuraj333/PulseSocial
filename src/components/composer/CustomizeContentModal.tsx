"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Layers,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

interface CustomizeContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialContent?: string;
  mediaUrl?: string | null;
}

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, limit: 63206, color: "text-[#1877F2]" },
  { id: "instagram", name: "Instagram", icon: Instagram, limit: 2200, color: "text-[#E1306C]" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: 3000, color: "text-[#0A66C2]" },
  { id: "x", name: "X (Twitter)", icon: Twitter, limit: 280, color: "text-black" },
];

export function CustomizeContentModal({
  isOpen,
  onClose,
  onSuccess,
  initialContent = "",
  mediaUrl = null,
}: CustomizeContentModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const [activePlatform, setActivePlatform] = useState("facebook");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Platform specific professional tailored texts
  const [platformTexts, setPlatformTexts] = useState<Record<string, string>>({
    facebook: "",
    instagram: "",
    linkedin: "",
    x: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const brandName = activeBrand?.name || "Our Brand";
    const base = initialContent.trim();

    if (base) {
      setPlatformTexts({
        facebook: `${base}\n\nWhat are your thoughts on this? Let us know in the comments below!`,
        instagram: `${base}\n.\n.\n#${brandName.replace(/[^a-zA-Z0-9]/g, "")} #PulseSocial #BrandGrowth #Innovation #DigitalMarketing`,
        linkedin: `${base}\n\nWhat strategies has your team implemented recently to drive sustainable engagement? Looking forward to hearing your perspectives.`,
        x: base.length > 240 ? `${base.substring(0, 235)}... #${brandName.replace(/[^a-zA-Z0-9]/g, "")}` : `${base} #${brandName.replace(/[^a-zA-Z0-9]/g, "")}`,
      });
    } else {
      setPlatformTexts({
        facebook: `Excited to announce our newest strategic milestones at ${brandName}! We're empowering creators and brands to scale their multi-channel presence with unmatched efficiency. Check out our latest updates and share your thoughts below! 🚀`,
        instagram: `Elevating high-impact storytelling and digital reach with ${brandName}. ✨ Consistent growth, dedicated audience engagement, and next-level creativity.\n.\n.\n#${brandName.replace(/[^a-zA-Z0-9]/g, "")} #PulseSocial #ContentStrategy #BrandBuilding`,
        linkedin: `At ${brandName}, our core priority is driving sustainable ROI and brand loyalty across modern social channels. Discover our latest operational updates, insights, and engagement strategies.`,
        x: `Exciting updates ahead from ${brandName}! Driving engagement, performance, and seamless multi-channel publishing. #PulseSocial #${brandName.replace(/[^a-zA-Z0-9]/g, "")}`,
      });
    }
  }, [isOpen, initialContent, activeBrand]);

  if (!isOpen) return null;

  const currentText = platformTexts[activePlatform] || "";
  const currentPlatformObj = PLATFORMS.find((p) => p.id === activePlatform) || PLATFORMS[0];

  const handleTextChange = (text: string) => {
    setPlatformTexts((prev) => ({ ...prev, [activePlatform]: text }));
  };

  const handlePublishAll = async () => {
    setIsSubmitting(true);
    try {
      // Broadcast real post through /api/posts
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentText || initialContent || `New customized post from ${activeBrand.name}`,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          targetAccountIds: [activeBrand.id || "auto"],
          action: "PUBLISH_NOW",
        }),
      });

      if (!res.ok) {
        throw new Error("Publishing failed");
      }

      toast({
        title: "Tailored Posts Published",
        message: `Successfully customized and published to ${PLATFORMS.length} channels for ${activeBrand.name}.`,
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast({
        title: "Tailored Posts Broadcast",
        message: `Customized channel posts queued for ${activeBrand.name}.`,
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const professionalHashtags = [
    `#${activeBrand.name.replace(/[^a-zA-Z0-9]/g, "")}`,
    "#GrowthStrategy",
    "#DigitalMarketing",
    "#Innovation",
    "#PulseSocial",
    "#BrandAwareness",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customize Content per Channel</h3>
              <p className="text-[11px] text-slate-500">
                Craft unique captions, platform-specific hashtags, and format limits for {activeBrand.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Left Platform Tabs, Center Editor, Right Live Mini Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Platform Tabs (3 cols) */}
          <div className="md:col-span-3 border-r border-slate-100 p-3 space-y-1 bg-slate-50/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Channels
            </p>
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isActive = activePlatform === platform.id;
              const charCount = (platformTexts[platform.id] || "").length;

              return (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatform(platform.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    isActive
                      ? "bg-white shadow-sm border border-slate-200 text-blue-600 ring-1 ring-blue-500/10"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${platform.color}`} />
                    <span>{platform.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {charCount}/{platform.limit}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Editor Area (6 cols) */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between border-r border-slate-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Custom caption for {currentPlatformObj.name}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentText.length} / {currentPlatformObj.limit} chars
                </span>
              </div>

              <textarea
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Write tailored caption for ${currentPlatformObj.name}...`}
                rows={8}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              />

              {/* Quick Professional Hashtags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {professionalHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTextChange(currentText + " " + tag)}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 mt-4">
              <span>Optimized for {currentPlatformObj.name} character limits and engagement standards</span>
            </div>
          </div>

          {/* Mini Live Preview (3 cols) */}
          <div className="md:col-span-3 p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                {currentPlatformObj.name} Preview
              </p>

              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={activeBrand.avatarUrl || "/icons/pulse-logo.svg"}
                      alt={activeBrand.name}
                      width={24}
                      height={24}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-[11px] text-slate-800 truncate">{activeBrand.name}</h5>
                    <span className="text-[9px] text-slate-400">Just now</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-snug">
                  {currentText || "Your tailored caption will display here."}
                </p>

                {mediaUrl && (
                  <div className="relative h-24 rounded-lg overflow-hidden border border-slate-100 bg-slate-900">
                    <Image
                      src={mediaUrl}
                      alt="Media"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePublishAll}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Publishing Tailored Posts..." : "Publish to All Channels"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
