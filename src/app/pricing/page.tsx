"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle, Sparkles, Plus, Minus } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [dynamicPlans, setDynamicPlans] = useState<any[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  React.useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.plans) && d.plans.length > 0) {
          setDynamicPlans(d.plans);
        }
      })
      .catch(() => {});
  }, []);

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      desc: "Ideal for independent creators and emerging influencers building audience momentum.",
      priceMonthly: "$19",
      priceAnnual: "$15",
      badge: null,
      highlight: false,
      ctaLabel: "Get Started",
      ctaHref: "/signup?plan=starter",
      features: [
        "Up to 5 Social Accounts",
        "Unlimited Scheduled Posts",
        "Standard AI Copy Generator",
        "Basic Analytics & Reach Metrics",
        "Unified Comment Inbox",
      ],
    },
    {
      name: "Professional",
      slug: "professional",
      desc: "Engineered for scaling creators, fast-growing brands, and dynamic marketing teams.",
      priceMonthly: "$49",
      priceAnnual: "$39",
      period: "per month, billed annually",
      badge: "Most Popular",
      highlight: true,
      ctaLabel: "Choose Professional",
      ctaHref: "/signup?plan=professional",
      features: [
        "Up to 15 Connected Accounts",
        "Gemini 2.5 Flash AI Assistant",
        "Multi-Channel Simultaneous Broadcast",
        "Advanced Analytics & PDF Reports",
        "Team Approvals & Roles",
        "Unified Direct Messages & Chat",
      ],
    },
    {
      name: "Agency & Enterprise",
      slug: "agency",
      desc: "For digital agencies and multi-brand corporate teams managing enterprise scale.",
      priceMonthly: "$99",
      priceAnnual: "$79",
      period: "per month, billed annually",
      badge: "Agency Choice",
      highlight: false,
      ctaLabel: "Start Agency Plan",
      ctaHref: "/signup?plan=agency",
      features: [
        "Unlimited Social Channels & Brands",
        "Dedicated IP & Custom Webhooks",
        "Audit Logging & SSO Security",
        "AI Prompt Enhancer & Auto-Publish",
        "White-label Reports & Client Portals",
        "24/7 Priority Support & SLA",
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I connect multiple accounts on the same social network?",
      a: "Yes! PulseSocial supports multiple accounts per platform, such as 3 Instagram professional profiles, 5 Facebook pages, and 2 LinkedIn company pages within the same workspace.",
    },
    {
      q: "Does PulseSocial require my social media passwords?",
      a: "Never. PulseSocial operates 100% on official OAuth 2.0 authorization protocols. You authenticate directly on the third-party provider's official screen. We never collect or store your passwords.",
    },
    {
      q: "What happens when my free trial ends?",
      a: "You can choose to upgrade to any paid plan or remain on our generous Free Starter tier with 3 connected channels. We never charge you automatically without your consent.",
    },
    {
      q: "Can I cancel or switch plans at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from the Workspace Settings > Billing dashboard.",
    },
  ];

  const displayPlans = dynamicPlans.length > 0 ? dynamicPlans : plans;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3 sm:space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5846A8] dark:text-[#FBBF24]">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Invest in Smarter Social Growth
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            All plans include official OAuth integrations, secure token vaulting, and our core universal post composer.
          </p>

          {/* Billing Cycle Switcher with normalized spacing */}
          <div className="mt-6 sm:mt-8 pt-2 flex items-center justify-center gap-3">
            <div className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs inline-flex items-center">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#5846A8] text-white shadow-xs dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:text-slate-950 dark:font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-[#5846A8] text-white shadow-xs dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:text-slate-950 dark:font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-amber-500/20 text-[#5846A8] dark:text-[#FBBF24] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {displayPlans.map((p) => {
            const price = billingCycle === "annual" ? p.priceAnnual : p.priceMonthly;
            const ctaText =
              p.ctaLabel ||
              (p.highlight ? "Choose Professional" : p.slug === "agency" ? "Start Agency Plan" : "Get Started");
            const href = p.ctaHref
              ? `${p.ctaHref.split("?")[0]}?plan=${p.slug || "starter"}&billing=${billingCycle}`
              : `/signup?plan=${p.slug || "starter"}&billing=${billingCycle}`;

            return (
              <div
                key={p.name}
                className={`relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#16161D] border transition-all duration-200 flex flex-col justify-between ${
                  p.highlight
                    ? "border-[#5846A8] dark:border-[#E08738] shadow-xl ring-2 ring-[#5846A8]/20 dark:ring-[#E08738]/20"
                    : "border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#5846A8] dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[34px]">
                    {p.desc}
                  </p>

                  <div className="mb-6 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">
                        {price}
                      </span>
                      {price !== "Custom" && (
                        <span className="text-xs text-slate-500">/month</span>
                      )}
                    </div>
                    {p.period && (
                      <p className="text-[10px] text-slate-400 mt-1">{p.period}</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                    {p.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#5846A8] dark:text-[#E08738] shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={href}
                  className={`w-full py-3 text-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-98 ${
                    p.highlight
                      ? "bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/30 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-110 dark:text-slate-950 dark:shadow-amber-500/25"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-700/80 shadow-xs"
                  }`}
                >
                  {ctaText}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout Banner with vertically balanced text & actions */}
        <div className="mb-10 sm:mb-12 p-6 sm:p-7 rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5846A8] dark:text-[#FBBF24]">
              Custom Scalability
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Need custom volume, dedicated IP, or enterprise SLA?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Our engineering solutions team provides custom brand migration, bespoke approval topologies, and hardware security token vaults.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0 my-auto">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold text-xs transition shadow-md shadow-purple-900/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Contact Enterprise Sales</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions about billing, permissions, or platform support?
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-all duration-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer transition hover:bg-slate-50/50 dark:hover:bg-slate-850/50 select-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white pr-4">
                      {faq.q}
                    </h3>
                    <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-transform duration-200">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 text-purple-600 dark:text-amber-400" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-1 animate-in fade-in duration-200">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
