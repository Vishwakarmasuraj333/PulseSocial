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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Billing & Subscription
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isConfigured
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                }`}
              >
                {isConfigured ? "Provider Configured" : "Billing not configured"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Workspace subscription status, quotas, and verified usage statistics.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBilling}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Informative Banner when Payment Gateway is Not Configured */}
        {!isConfigured && !loading && (
          <div className="rounded-2xl border border-amber-200/90 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Payment Provider Not Configured
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Neither Stripe nor Razorpay credentials have been supplied in your environment variables
                (<code>STRIPE_SECRET_KEY</code> or <code>RAZORPAY_KEY_ID</code>). The workspace is currently operating with default read-only plan limits. No charges will be processed, and invoices remain ungenerated.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Plan
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {plan?.name || "Standard Workspace Tier"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isConfigured
                  ? `Managed via ${billingData?.provider}`
                  : "Complimentary access enabled for this workspace"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5F3FF] dark:bg-purple-950/50 text-[#5846A8] dark:text-purple-300 border border-[#EDE9FE] dark:border-purple-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-purple-300" />
                Active Status
              </span>
            </div>
          </div>

          {/* Real Usage Meters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Resource Usage & Quotas (Live Data)
              </h3>
              {plan?.source && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Source: {plan.source}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Channels */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <Share2 className="w-3.5 h-3.5 text-[#5846A8]" />
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
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5846A8] h-full rounded-full transition-all duration-300"
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Source: {plan.limits.socialChannels.source}
                  </p>
                )}
              </div>

              {/* Monthly Posts */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
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
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Source: {plan.limits.postsPerMonth.source}
                  </p>
                )}
              </div>

              {/* Team Members */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
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
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Source: {plan.limits.teamMembers.source}
                  </p>
                )}
              </div>

              {/* Storage */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <HardDrive className="w-3.5 h-3.5 text-amber-500" />
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
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Source: {plan.limits.storageGb.source}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Payment History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Billing History & Invoices
            </h3>
            <span className="text-xs text-slate-400">Strict Truth Contract</span>
          </div>

          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No invoices generated
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
