"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Plus, Sparkles, ExternalLink, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BRAND_PLATFORMS = [
  { id: "facebook", name: "Facebook", desc: "Connect a Facebook account associated with the Business Page you'd like to add." },
  { id: "x", name: "X", desc: "Connect a X account you'd like to add." },
  { id: "linkedin", name: "LinkedIn", desc: "Connect a LinkedIn account associated with the Profile and/or Company Page you'd like to add." },
  { id: "instagram", name: "Instagram", desc: "Connect an Instagram Professional Account you'd like to add." },
  { id: "google_business", name: "Google Business Profile", desc: "Connect a Google Business Profile account associated with the business listing you'd like to add." },
  { id: "youtube", name: "YouTube", desc: "Connect the YouTube channel you'd like to add." },
  { id: "pinterest", name: "Pinterest", desc: "Connect a Pinterest account you'd like to add." },
  { id: "mastodon", name: "Mastodon", desc: "Connect a Mastodon server" },
  { id: "threads", name: "Threads", desc: "Connect a Threads account you'd like to add." },
  { id: "telegram", name: "Telegram", desc: "Connect a Telegram account you'd like to add." },
  { id: "whatsapp", name: "WhatsApp", desc: "Connect a WhatsApp account you'd like to add." },
  { id: "bluesky", name: "Bluesky", desc: "Connect a Bluesky account you'd like to add." },
  { id: "snapchat", name: "Snapchat", desc: "Connect a Snapchat Professional Account you'd like to add." },
  { id: "arattai", name: "Arattai", desc: "Connect the Arattai account you'd like to add." },
];

export function AddBrandModal({ isOpen, onClose }: AddBrandModalProps) {
  const { addBrand } = useBrand();
  const { toast } = useToast();

  // Step: "trial_notice" (Screenshot 1) vs "setup_channels" (Screenshot 2) vs "name_brand"
  const [step, setStep] = useState<"trial_notice" | "setup_channels" | "name_brand">("trial_notice");
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [brandName, setBrandName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPlatformObj =
    BRAND_PLATFORMS.find((p) => p.id === selectedPlatform) || BRAND_PLATFORMS[0];

  const handleConnectChannel = () => {
    setStep("name_brand");
  };

  const handleCreateBrandFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast({
        title: "Brand Name Required",
        message: "Please enter a name for your new brand.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newBrand = addBrand({
        name: brandName.trim(),
        industry: "Digital Media",
        color: "#1877F2",
      });

      toast({
        title: "Brand Created Successfully!",
        message: `Switched to workspace for ${newBrand.name}.`,
        type: "success",
      });

      setBrandName("");
      setStep("trial_notice");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      {/* ======================================================== */}
      {/* STEP 1: Want to add more Brands to your portal (Screenshot 1) */}
      {/* ======================================================== */}
      {step === "trial_notice" && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-8 text-center space-y-6 relative animate-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Want to add more Brands to your portal
          </h2>

          {/* Infinity Loop Illustration matching Screenshot 1 */}
          <div className="py-2 flex justify-center">
            <div className="relative w-72 h-36 flex items-center justify-center">
              {/* Browser window preview in top-left loop */}
              <div className="w-40 h-24 rounded-lg border-2 border-slate-700 bg-white p-1.5 shadow-sm space-y-1">
                <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="w-12 h-8 rounded bg-sky-100/70 mt-1" />
                <div className="w-20 h-1.5 bg-slate-200 rounded" />
              </div>

              {/* Infinity loop overlay line */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 280 140"
                fill="none"
              >
                <path
                  d="M 50 70 C 50 40, 100 40, 140 70 C 180 100, 230 100, 230 70 C 230 40, 180 40, 140 70 C 100 100, 50 100, 50 70 Z"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Node badges */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center shadow">
                <span className="text-xs font-bold text-emerald-600">↑</span>
              </div>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center shadow">
                <span className="text-xs font-bold text-blue-600">+</span>
              </div>
            </div>
          </div>

          {/* Explanatory Copy matching Screenshot 1 */}
          <div className="space-y-3 max-w-lg mx-auto text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800">
              To explore our wide range of features, you can add unlimited brands during the trial period.
            </p>
            <p>
              Please note that the Premium plan comes with <strong className="text-slate-900 font-bold">one Brand</strong>. Additional brands added during your trial period can be purchased as add-ons after you subscribe (Hit <strong className="text-slate-900 font-bold">Upgrade now</strong> to subscribe).
            </p>
            <p>
              Click on <strong className="text-slate-900 font-bold">Add Brand</strong> to continue adding new Brands to your Portal.
            </p>
          </div>

          {/* Action Buttons matching Screenshot 1 */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 w-full justify-center">
              <button
                type="button"
                onClick={() => {
                  toast({
                    title: "Enterprise Plan Active",
                    message: "Unlimited Brands already unlocked for your account.",
                    type: "info",
                  });
                  setStep("setup_channels");
                }}
                className="px-6 py-2.5 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition cursor-pointer"
              >
                Upgrade Now
              </button>

              <button
                type="button"
                onClick={() => setStep("setup_channels")}
                className="px-7 py-2.5 rounded-full bg-[#1e88e5] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                Add Brand
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

     
      {step === "setup_channels" && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Top Bar matching Screenshot 2 */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Get started by setting up a Brand
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 14 Social Platforms Row matching Screenshot media_1790061041892.png */}
          <div className="px-6 border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none min-w-max">
            {BRAND_PLATFORMS.map((p) => {
              const isSelected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`relative px-2 pt-2.5 pb-2 flex flex-col items-center transition cursor-pointer ${
                    isSelected
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "border-b-2 border-transparent opacity-75 hover:opacity-100 hover:border-slate-300"
                  }`}
                  title={p.name}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                    {renderPlatformIcon(p.id, 28)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Platform Instructions & Connect Button */}
          <div className="p-8 space-y-6">
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
              {currentPlatformObj.desc}
            </p>

            <button
              type="button"
              onClick={handleConnectChannel}
              className="px-6 py-2.5 rounded-md bg-[#1e88e5] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              Connect {currentPlatformObj.name}
            </button>

            {/* Explanatory Footer matching Screenshot media_1790061041892.png */}
            <p className="text-[11px] text-slate-500 pt-4 border-t border-slate-100 leading-relaxed">
              A Brand is a collection of social media channels that are all managed through a single dashboard. You can add one of each type of channel to a Brand.{" "}
              <a
                href="/resources"
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Learn more.
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: Enter Brand Name & Confirm                     */}
      {/* ======================================================== */}
      {step === "name_brand" && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">Name Your Brand</h4>
            <button
              type="button"
              onClick={() => setStep("setup_channels")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateBrandFinal} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Brand Display Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Global, Stellar Brand, Apex Media"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                autoFocus
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
              <span className="font-semibold block text-slate-800">Primary Channel:</span>
              <div className="flex items-center gap-2">
                {renderPlatformIcon(selectedPlatform, 18)}
                <span>{currentPlatformObj.name} will be connected to this Brand.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("setup_channels")}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                {isSubmitting ? "Creating Brand..." : "Save & Launch Brand"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
