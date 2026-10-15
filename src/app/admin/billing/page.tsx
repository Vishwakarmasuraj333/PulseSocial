"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Plus,
  Edit2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  featuresJson: string;
  limitsJson: string | null;
  isPopular: boolean;
  isActive: boolean;
}

export default function AdminBillingPage() {
  const { toast } = useToast();

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Plan Modal
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [priceMonthly, setPriceMonthly] = useState(0);
  const [priceAnnual, setPriceAnnual] = useState(0);
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/billing/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err: any) {
      toast({
        title: "Error Loading Plans",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEditModal = (plan: PlanItem) => {
    setEditingPlan(plan);
    setIsCreatingNew(false);
    setName(plan.name);
    setSlug(plan.slug);
    setPriceMonthly(plan.priceMonthly);
    setPriceAnnual(plan.priceAnnual);
    setDescription(plan.description);
    try {
      const parsed = JSON.parse(plan.featuresJson);
      setFeaturesText(Array.isArray(parsed) ? parsed.join("\n") : "");
    } catch {
      setFeaturesText("");
    }
    setIsPopular(plan.isPopular);
    setIsActive(plan.isActive);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setIsCreatingNew(true);
    setName("");
    setSlug("");
    setPriceMonthly(29);
    setPriceAnnual(290);
    setDescription("");
    setFeaturesText("5 Connected Channels\nUnlimited Posts\nStandard Analytics");
    setIsPopular(false);
    setIsActive(true);
  };

  const handleSavePlan = async () => {
    try {
      setIsSaving(true);
      const featuresArray = featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name,
        slug: slug.toLowerCase().trim(),
        priceMonthly,
        priceAnnual,
        description,
        featuresJson: JSON.stringify(featuresArray),
        isPopular,
        isActive,
      };

      let res;
      if (isCreatingNew) {
        res = await fetch("/api/admin/billing/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editingPlan) {
        res = await fetch(`/api/admin/billing/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res || !res.ok) throw new Error("Failed to save pricing plan");

      toast({
        title: isCreatingNew ? "Plan Created" : "Plan Saved",
        message: `Successfully saved ${name}`,
        type: "success",
      });

      setEditingPlan(null);
      setIsCreatingNew(false);
      fetchPlans();
    } catch (err: any) {
      toast({
        title: "Save Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription & Pricing Plans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure live SaaS subscription tiers, feature entitlements, and commercial billing models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#6F52B5] hover:bg-[#59409A] text-white transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>

          <button
            onClick={fetchPlans}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6F52B5]" />
          <p className="text-xs">Loading pricing models from database...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">No active pricing plans found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            let features: string[] = [];
            try {
              features = JSON.parse(p.featuresJson);
            } catch {}

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 border shadow-2xs ${
                  p.isPopular
                    ? "border-[#6F52B5] ring-1 ring-[#6F52B5]/30"
                    : "border-slate-200/80 dark:border-slate-800/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {p.name}
                    </span>
                    {p.isPopular && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6F52B5] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                        <Sparkles className="w-3 h-3" />
                        <span>POPULAR</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] line-clamp-2">
                    {p.description}
                  </p>

                  {/* Pricing Display */}
                  <div className="my-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ${p.priceMonthly}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      or ${p.priceAnnual}/year (save ~20%)
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Included Features:
                    </span>
                    {features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>

                  <button
                    onClick={() => openEditModal(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Tier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit or Create Plan Modal */}
      {(editingPlan || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => {
              setEditingPlan(null);
              setIsCreatingNew(false);
            }}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 z-10 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isCreatingNew ? "Create New Pricing Plan" : `Edit Plan: ${editingPlan?.name}`}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Slug (unique)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Price ($)
                  </label>
                  <input
                    type="number"
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Plan Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Features (one bullet per line)
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded border-slate-300 text-[#6F52B5] focus:ring-[#6F52B5]"
                  />
                  <span>Mark as Popular Tier</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#6F52B5] focus:ring-[#6F52B5]"
                  />
                  <span>Active & Available for Checkout</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F52B5] hover:bg-[#59409A] text-white flex items-center gap-1.5"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
