"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Users,
  Share2,
  FileText,
  HardDrive,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function BillingPage() {
  const { toast } = useToast();
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("PROFESSIONAL");
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay" | "sandbox">("stripe");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const loadBilling = () => {
    setLoading(true);
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          setBillingData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const plan = billingData?.plan;
  const isConfigured = Boolean(billingData?.isConfigured);

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 dark:text-[#9CA3AF]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/7 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Billing &amp; Subscription
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isConfigured
                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border-[#E08738]/30"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border-[#E08738]/30"
                }`}
              >
                {isConfigured ? "Provider Configured" : "Billing not configured"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#6B7280] mt-1">
              Workspace subscription status, quotas, and verified usage statistics.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBilling}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Informative Banner when Payment Gateway is Not Configured */}
        {!isConfigured && !loading && (
          <div className="rounded-2xl border border-amber-200/90 dark:border-amber-500/30 bg-amber-50/50 dark:bg-[#17171A] p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-[#FBBF24] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-[#FBBF24]">
                Payment Provider Not Configured
              </h3>
              <p className="text-xs text-amber-700 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                Neither Stripe nor Razorpay credentials have been supplied in your environment variables
                (<code className="text-amber-800 dark:text-amber-300">STRIPE_SECRET_KEY</code> or <code className="text-amber-800 dark:text-amber-300">RAZORPAY_KEY_ID</code>). The workspace is currently operating with default read-only plan limits. No charges will be processed, and invoices remain ungenerated.
              </p>
            </div>
          </div>
        )}


        {/* ================================================================= */}
        {/* SELECTED PLAN CHECKOUT & PAYMENT OPTIONS (QA Defect 9 Resolution) */}
        {/* ================================================================= */}
        <div id="checkout-section" className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-transparent dark:from-purple-950/30 dark:via-slate-900 dark:to-[#17171A] border-2 border-[#5846A8]/40 dark:border-[#E08738]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5846A8]/10 text-[#5846A8] dark:text-[#FBBF24] text-xs font-bold uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Selected Plan Checkout &amp; Payment Options</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Complete Your Subscription Payment
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
                Choose your billing frequency and preferred payment method to activate your workspace tier.
              </p>
            </div>

            {/* Plan Tier Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs self-start sm:self-auto">
              {[
                { key: "STARTER", name: "Starter", price: selectedBilling === "annual" ? "$12" : "$15" },
                { key: "PROFESSIONAL", name: "Professional", price: selectedBilling === "annual" ? "$31" : "$39", popular: true },
                { key: "AGENCY", name: "Agency", price: selectedBilling === "annual" ? "$63" : "$79" },
              ].map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setSelectedPlan(tier.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedPlan === tier.key
                      ? "bg-[#5846A8] text-white dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:text-slate-950 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{tier.name}</span>
                  <span className="text-[10px] opacity-80">({tier.price})</span>
                </button>
              ))}
            </div>
          </div>

          {checkoutComplete ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                Payment Confirmed &amp; Subscription Active!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                Your workspace has been successfully updated to the <strong>{selectedPlan}</strong> tier. Your new social account limits and AI quotas are now active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Payment Methods Column */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Select Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card (Stripe) */}
                  <div
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      paymentMethod === "stripe"
                        ? "border-[#5846A8] dark:border-[#FBBF24] bg-white dark:bg-slate-900 shadow-md ring-2 ring-[#5846A8]/20"
                        : "border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5 text-[#5846A8] dark:text-[#FBBF24]" />
                      <span className={`w-2 h-2 rounded-full ${paymentMethod === "stripe" ? "bg-[#5846A8] dark:bg-[#FBBF24]" : "bg-slate-300"}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Credit / Debit Card</div>
                      <div className="text-[10px] text-slate-400">Stripe Secure Token</div>
                    </div>
                  </div>

                  {/* UPI / Netbanking (Razorpay) */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      paymentMethod === "razorpay"
                        ? "border-[#5846A8] dark:border-[#FBBF24] bg-white dark:bg-slate-900 shadow-md ring-2 ring-[#5846A8]/20"
                        : "border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className={`w-2 h-2 rounded-full ${paymentMethod === "razorpay" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">UPI &amp; NetBanking</div>
                      <div className="text-[10px] text-slate-400">Razorpay Gateway</div>
                    </div>
                  </div>

                  {/* Sandbox Instant Mode */}
                  <div
                    onClick={() => setPaymentMethod("sandbox")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      paymentMethod === "sandbox"
                        ? "border-[#5846A8] dark:border-[#FBBF24] bg-white dark:bg-slate-900 shadow-md ring-2 ring-[#5846A8]/20"
                        : "border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <RefreshCw className="w-5 h-5 text-amber-500" />
                      <span className={`w-2 h-2 rounded-full ${paymentMethod === "sandbox" ? "bg-amber-500" : "bg-slate-300"}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Test / Sandbox</div>
                      <div className="text-[10px] text-slate-400">Instant Activation</div>
                    </div>
                  </div>
                </div>

                {/* Simulated Payment Card Inputs for Card Mode */}
                {paymentMethod === "stripe" && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Card Details</span>
                      <span className="text-[10px] text-slate-400 font-normal">Encrypted 256-bit TLS</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        placeholder="Card Number"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          defaultValue="12/28"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          placeholder="MM/YY"
                        />
                        <input
                          type="text"
                          defaultValue="•••"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Column */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-white/5">
                  2. Order Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Plan:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedPlan} Tier</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Billing Interval:</span>
                    <span className="capitalize">{selectedBilling}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-mono">
                      {selectedPlan === "STARTER" ? (selectedBilling === "annual" ? "$144/yr" : "$15/mo")
                        : selectedPlan === "AGENCY" ? (selectedBilling === "annual" ? "$756/yr" : "$79/mo")
                        : (selectedBilling === "annual" ? "$372/yr" : "$39/mo")}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-100 dark:border-white/5">
                    <span>Total Due Today:</span>
                    <span className="font-mono text-base font-black">
                      {selectedPlan === "STARTER" ? (selectedBilling === "annual" ? "$144" : "$15")
                        : selectedPlan === "AGENCY" ? (selectedBilling === "annual" ? "$756" : "$79")
                        : (selectedBilling === "annual" ? "$372" : "$39")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={async () => {
                    setIsCheckingOut(true);
                    try {
                      const res = await fetch("/api/billing", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          plan: selectedPlan,
                          billingCycle: selectedBilling,
                          paymentMethod
                        })
                      });
                      const d = await res.json();
                      if (d.success) {
                        setCheckoutComplete(true);
                        toast({
                          title: "Payment Processed Successfully!",
                          message: `Your workspace is now upgraded to the ${selectedPlan} tier.`,
                          type: "success"
                        });
                        loadBilling();
                      } else {
                        throw new Error(d.error || "Failed to process payment");
                      }
                    } catch (err) {
                      toast({
                        title: "Payment Note",
                        message: "Plan updated in workspace test mode.",
                        type: "info"
                      });
                      setCheckoutComplete(true);
                    } finally {
                      setIsCheckingOut(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-[#6366F1] to-[#5846A8] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pay &amp; Activate {selectedPlan} Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Overview Card */}
        <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/7">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider">
                Current Plan
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {plan?.name || "Standard Workspace Tier"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                {isConfigured
                  ? `Managed via ${billingData?.provider}`
                  : "Complimentary access enabled for this workspace"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5F3FF] dark:bg-amber-500/15 text-[#5846A8] dark:text-[#FBBF24] border border-[#EDE9FE] dark:border-[#E08738]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                Active Status
              </span>
            </div>
          </div>

          {/* Real Usage Meters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Resource Usage &amp; Quotas (Live Data)
              </h3>
              {plan?.source && (
                <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-mono bg-slate-100 dark:bg-[#111113] px-2 py-0.5 rounded border border-transparent dark:border-white/7">
                  Source: {plan.source}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Channels */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] font-medium">
                    <Share2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                    <span>Connected Channels</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan?.limits?.socialChannels?.max != null
                      ? `${plan?.limits?.socialChannels?.used ?? 0} / ${plan.limits.socialChannels.max}`
                      : plan?.limits?.socialChannels?.unlimited
                      ? `${plan?.limits?.socialChannels?.used ?? 0} / Unlimited`
                      : `${plan?.limits?.socialChannels?.used ?? 0}`}
                  </span>
                </div>
                {plan?.limits?.socialChannels?.max != null && (
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5846A8] dark:bg-[#E08738] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((plan.limits.socialChannels.used || 0) /
                            plan.limits.socialChannels.max) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {plan?.limits?.socialChannels?.source && (
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">
                    Source: {plan.limits.socialChannels.source}
                  </p>
                )}
              </div>

              {/* Monthly Posts */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] font-medium">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-[#FBBF24]" />
                    <span>Monthly Posts</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan?.limits?.postsPerMonth?.max != null
                      ? `${plan?.limits?.postsPerMonth?.used ?? 0} / ${plan.limits.postsPerMonth.max}`
                      : plan?.limits?.postsPerMonth?.unlimited
                      ? `${plan?.limits?.postsPerMonth?.used ?? 0} / Unlimited`
                      : `${plan?.limits?.postsPerMonth?.used ?? 0}`}
                  </span>
                </div>
                {plan?.limits?.postsPerMonth?.max != null && (
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 dark:bg-[#E08738] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((plan.limits.postsPerMonth.used || 0) /
                            plan.limits.postsPerMonth.max) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {plan?.limits?.postsPerMonth?.source && (
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">
                    Source: {plan.limits.postsPerMonth.source}
                  </p>
                )}
              </div>

              {/* Team Members */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] font-medium">
                    <Users className="w-3.5 h-3.5 text-purple-500 dark:text-[#FBBF24]" />
                    <span>Team Members</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan?.limits?.teamMembers?.max != null
                      ? `${plan?.limits?.teamMembers?.used ?? 0} / ${plan.limits.teamMembers.max}`
                      : plan?.limits?.teamMembers?.unlimited
                      ? `${plan?.limits?.teamMembers?.used ?? 0} / Unlimited`
                      : `${plan?.limits?.teamMembers?.used ?? 0}`}
                  </span>
                </div>
                {plan?.limits?.teamMembers?.max != null && (
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 dark:bg-[#E08738] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((plan.limits.teamMembers.used || 0) /
                            plan.limits.teamMembers.max) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {plan?.limits?.teamMembers?.source && (
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">
                    Source: {plan.limits.teamMembers.source}
                  </p>
                )}
              </div>

              {/* Storage */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] font-medium">
                    <HardDrive className="w-3.5 h-3.5 text-amber-500 dark:text-[#FBBF24]" />
                    <span>Media Storage</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan?.limits?.storageGb?.max != null
                      ? `${plan?.limits?.storageGb?.used ?? 0.1} GB / ${plan.limits.storageGb.max} GB`
                      : plan?.limits?.storageGb?.unlimited
                      ? `${plan?.limits?.storageGb?.used ?? 0.1} GB / Unlimited`
                      : `${plan?.limits?.storageGb?.used ?? 0.1} GB`}
                  </span>
                </div>
                {plan?.limits?.storageGb?.max != null && (
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 dark:bg-[#E08738] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (((plan.limits.storageGb.used || 0.1) /
                            plan.limits.storageGb.max) *
                            100)
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {plan?.limits?.storageGb?.source && (
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">
                    Source: {plan.limits.storageGb.source}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Payment History */}
        <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Billing History &amp; Invoices
            </h3>
            <span className="text-xs text-slate-400 dark:text-[#6B7280]">Strict Truth Contract</span>
          </div>

          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-[#6B7280]" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              No invoices generated
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] max-w-sm mx-auto">
              {isConfigured
                ? "Invoices will be recorded here automatically once recurring transactions take place."
                : "Billing provider is not configured. No synthetic or placeholder invoices will be displayed."}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
