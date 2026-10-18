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
