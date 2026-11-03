"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import {
  Smartphone,
  Apple,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Share,
  PlusCircle,
  Download,
  ShieldCheck,
  Zap,
  Bell,
  Layers,
  HelpCircle,
  Check,
} from "lucide-react";

export default function MobileAppPage() {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitBeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "Can I use PulseSocial on my phone right now?",
      a: "Yes! PulseSocial is fully optimized as a Progressive Web App (PWA). You can open it in Safari (iOS) or Chrome (Android) and add it to your Home Screen for an instant native app experience with zero app store delays.",
    },
    {
      q: "When will the native iOS App Store and Google Play apps be released?",
      a: "PulseSocial native apps are currently in private TestFlight (iOS) and Internal Testing (Google Play Console) certification. Public general availability is scheduled for Q4 2026. Join our VIP beta list above to get invited today.",
    },
    {
      q: "Does the mobile web app support all 11+ social networks?",
      a: "Yes. All official OAuth 2.0 integrations (Instagram, Facebook, LinkedIn, X, TikTok, YouTube, Pinterest, Threads, etc.) and the Universal Post Composer work seamlessly on mobile.",
    },
    {
      q: "Can I receive push notifications for scheduled post approvals?",
      a: "Yes, once added to your Home Screen on iOS 16.4+ or Android, Web Push notifications deliver real-time post confirmations and engagement alerts directly to your phone's lock screen.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white font-sans flex flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO SECTION                                                 */}
        {/* ============================================================ */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-slate-800/80">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>PulseSocial Mobile Experience</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-emerald-400 font-bold">PWA Live</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Social Media Command Center, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Right in Your Pocket
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Create compelling multi-network posts, review audience metrics, approve team drafts, and manage publishing queues wherever you are.
            </p>

            {/* Quick Action CTA Group */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold text-sm transition shadow-lg shadow-purple-900/40 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch Mobile Web App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#install-guide"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>1-Click Install Guide</span>
              </a>
            </div>

            {/* App Store Status Notice */}
            <div className="mt-8 max-w-xl mx-auto p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Native iOS (TestFlight) &amp; Android (Google Play) builds are currently in private certification for Q4 2026 release.
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 1-CLICK PWA INSTALLATION GUIDE                                */}
        {/* ============================================================ */}
        <section id="install-guide" className="py-20 sm:py-24 bg-slate-900/50 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Instant Access Without App Store Wait
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Install PulseSocial on Your Home Screen
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Works 100% like a native app: full-screen layout, no browser address bar, instant launch, and fast offline caching.
              </p>
            </div>

            {/* Platform Selector */}
            <div className="flex justify-center mb-10">
              <div className="p-1 bg-slate-800/80 rounded-xl border border-slate-700 inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPlatform("ios")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    platform === "ios"
                      ? "bg-[#5846A8] text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Apple className="w-4 h-4" />
                  <span>iOS (iPhone &amp; iPad)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("android")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    platform === "android"
                      ? "bg-[#5846A8] text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Android (Chrome)</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {platform === "ios" ? (
                <>
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-base font-bold text-white">Open in Safari</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Visit <strong className="text-white">pulsesocial1.vercel.app</strong> using the Safari browser on your iPhone or iPad.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Tap Share</span>
                      <Share className="w-4 h-4 text-sky-400" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tap the Share icon at the bottom toolbar of Safari (box with an upward pointing arrow).
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Add to Home Screen</span>
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Scroll down in the share sheet and tap <strong className="text-white">&quot;Add to Home Screen&quot;</strong>, then confirm. PulseSocial icon will appear on your screen!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-base font-bold text-white">Open in Chrome</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Open Google Chrome on your Android smartphone and navigate to <strong className="text-white">pulsesocial1.vercel.app</strong>.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-base font-bold text-white">Tap Menu (⋮)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tap the three vertical dots (menu icon) in the top right corner of the Chrome browser.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Install App</span>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tap <strong className="text-white">&quot;Install App&quot;</strong> or <strong className="text-white">&quot;Add to Home screen&quot;</strong>. The app installs automatically in seconds!
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch &amp; Install PulseSocial Web App</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* VIP BETA EARLY ACCESS FORM                                    */}
        {/* ============================================================ */}
        <section className="py-20 sm:py-24 border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[90px] rounded-full pointer-events-none" />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Exclusive Developer &amp; Creator Program</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Request Early Access to the Native iOS / Android Builds
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Be the first to test our Apple TestFlight and Google Play Beta releases with offline drafting and biometrics before the official public store rollout.
              </p>

              {submitted ? (
                <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm max-w-md mx-auto flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Thank you! You&apos;ve been added to our VIP mobile beta list. We will email your TestFlight / Play Console invitation shortly.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitBeta} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-850 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold text-sm transition shadow-lg shadow-purple-900/30 shrink-0 cursor-pointer"
                  >
                    Get VIP Access
                  </button>
                </form>
              )}

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No credit card required</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant PWA available</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MOBILE FEATURES                                               */}
        {/* ============================================================ */}
        <section className="py-20 sm:py-24 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Engineered for High-Velocity Creators
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Full Desktop Power on Any Mobile Screen
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Universal Composer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compose once and broadcast simultaneously across Instagram, Facebook, LinkedIn, X, TikTok, and YouTube.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Interactive Queue</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drag and re-order upcoming social campaigns, reschedule slots on the fly, and pause queue anytime.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Real-Time Alerts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get instant mobile alerts when team members request post approvals or when scheduled posts go live.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Biometric Vault</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hardware-backed OAuth 2.0 token security with Face ID &amp; Touch ID authentication support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQS                                                         */}
        {/* ============================================================ */}
        <section className="py-20 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mobile App &amp; Availability
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-left"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6.5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
              >
                <span>← Back to PulseSocial Home</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

