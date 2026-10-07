"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [dynamicPlans, setDynamicPlans] = useState<any[]>([]);

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
      ctaLabel: "Start with Starter",
      ctaHref: "/signup",
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
      ctaLabel: "Start Professional",
      ctaHref: "/signup",
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
      ctaHref: "/signup",
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
      q: "Can I connect multiple accounts from the same social network?",
      a: "Yes! PulseSocial supports multiple accounts per platform, such as 3 Instagram Professional profiles, 5 Facebook Pages, and 2 LinkedIn Company Pages within the same workspace.",
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Invest in Smarter Social Growth
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            All plans include official OAuth integrations, secure token vaulting, and our core universal post composer.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs inline-flex items-center">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white shadow-xs"
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
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {(dynamicPlans.length > 0 ? dynamicPlans : plans).map((p) => {
            const price = billingCycle === "annual" ? p.priceAnnual : p.priceMonthly;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl p-6 bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                  p.highlight
                    ? "border-indigo-600 dark:border-indigo-500 shadow-xl ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[32px]">
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
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={p.ctaHref || "/signup"}
                  className={`w-full py-2.5 text-center rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                    p.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                      : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {p.ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions about billing, permissions, or platform support?
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
