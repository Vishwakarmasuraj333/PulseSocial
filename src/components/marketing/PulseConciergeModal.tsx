"use client";

import React, { useState } from "react";
import { X, PhoneCall, Calendar, CheckCircle2, UserCheck, Headset } from "lucide-react";

interface PulseConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PulseConciergeModal({ isOpen, onClose }: PulseConciergeModalProps) {
  const [formStep, setFormStep] = useState<"options" | "callback" | "demo" | "success">("options");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#2D7A58] dark:bg-[#1E523B] text-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-400/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-4 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Can't find what you're looking for?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                  We're here to help you.
                </p>
              </div>

              {formStep === "options" && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    <button
                      onClick={() => setFormStep("callback")}
                      className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                    >
                      Request a callback
                    </button>
                    <button
                      onClick={() => setFormStep("demo")}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                    >
                      Schedule a free demo
                    </button>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/40 text-[11px] text-emerald-100">
                    <div className="font-semibold text-white">Still not sure?</div>
                    <div>call us at <strong className="text-white">1800 103 1123</strong> | <strong className="text-white">1800 572 3535</strong></div>
                  </div>
                </div>
              )}

              {(formStep === "callback" || formStep === "demo") && (
                <form onSubmit={handleSubmit} className="space-y-2.5 pt-2 text-left">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white text-slate-900 text-xs font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <input
                      type={formStep === "callback" ? "tel" : "email"}
                      placeholder={formStep === "callback" ? "Your Phone Number" : "Your Business Email"}
                      value={formStep === "callback" ? phone : email}
                      onChange={(e) => (formStep === "callback" ? setPhone(e.target.value) : setEmail(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white text-slate-900 text-xs font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {formStep === "callback" ? "Call Me Back" : "Book My Demo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep("options")}
                      className="px-3 py-2 rounded-lg bg-white/20 text-white text-xs font-semibold hover:bg-white/30 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              {formStep === "success" && (
                <div className="pt-2 text-left space-y-2 bg-emerald-900/50 p-4 rounded-xl border border-emerald-400/40">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>Request Received!</span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    A PulseSocial product specialist will connect with you within 15 minutes.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 text-xs font-bold text-amber-300 underline cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>

            {/* Right Character Illustration matching PDF page 7 */}
            <div className="shrink-0 relative hidden sm:flex flex-col items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border-2 border-emerald-300/40 flex items-center justify-center shadow-inner overflow-hidden">
                <div className="relative flex flex-col items-center">
                  <Headset className="w-16 h-16 text-amber-300" />
                  <span className="w-2 h-2 rounded-full bg-emerald-300 absolute top-2 right-2 animate-ping" />
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-100 mt-2 text-center">
                Dedicated Specialist
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PulseStickyConcierge({ onOpen: _onOpen }: { onOpen?: () => void }) {
  return null;
}
