"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  COOKIE_CATEGORIES,
  CURRENT_POLICY_VERSION,
  LAST_POLICY_UPDATE,
  CONSENT_COOKIE_NAME,
} from "@/lib/consent/consent-config";

interface CookieConsentBannerProps {
  initialHasConsent?: boolean;
  initialConsentState?: {
    preferences: boolean;
    analytics: boolean;
    decision: string;
    policyVersion: string;
  } | null;
}

export function CookieConsentBanner({
  initialHasConsent = false,
  initialConsentState = null,
}: CookieConsentBannerProps) {
  // If the server detected valid consent, banner starts closed.
  const [isBannerVisible, setIsBannerVisible] = useState(!initialHasConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Categories state
  const [preferencesOptIn, setPreferencesOptIn] = useState(
    initialConsentState?.preferences ?? false
  );
  const [analyticsOptIn, setAnalyticsOptIn] = useState(
    initialConsentState?.analytics ?? false
  );

  // Error & submitting states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => Promise<void>) | null>(null);

  // Table expanders in preferences dialog
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Accessibility focus trap and return-to-trigger
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Check client-side cookie on mount to handle hydration / fresh state
  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const rawConsent = cookies.find((c) => c.startsWith(`${CONSENT_COOKIE_NAME}=`));
      if (rawConsent) {
        try {
          const parsed = JSON.parse(decodeURIComponent(rawConsent.split("=")[1]));
          if (parsed.policyVersion === CURRENT_POLICY_VERSION) {
            setIsBannerVisible(false);
            setPreferencesOptIn(Boolean(parsed.preferences));
            setAnalyticsOptIn(Boolean(parsed.analytics));
            return;
          }
        } catch {
          // invalid json, show banner
        }
      }
      // If no valid consent found, show banner
      setIsBannerVisible(true);
    }
  }, []);

  // Listen for custom event to open cookie settings from footer / settings / policy pages
  useEffect(() => {
    const handleOpenSettings = (e: Event) => {
      triggerRef.current = (e.target as HTMLElement) || document.activeElement;
      setErrorMessage(null);
      setIsPreferencesOpen(true);
    };

    window.addEventListener("pulsesocial_open_cookie_settings", handleOpenSettings);
    return () => {
      window.removeEventListener("pulsesocial_open_cookie_settings", handleOpenSettings);
    };
  }, []);

  // Dynamic bottom padding so banner never covers page content
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isBannerVisible && !isPreferencesOpen) {
      document.body.style.paddingBottom = "140px";
    } else {
      document.body.style.paddingBottom = "0px";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.paddingBottom = "0px";
      }
    };
  }, [isBannerVisible, isPreferencesOpen]);

  // Focus trap inside the preferences dialog
  useEffect(() => {
    if (!isPreferencesOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePreferences();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Initial focus on close button or dialog
    const initialFocus = dialogRef.current?.querySelector<HTMLElement>(
      'button[aria-label="Close preferences dialog"]'
    );
    if (initialFocus) {
      initialFocus.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreferencesOpen]);

  const closePreferences = () => {
    setIsPreferencesOpen(false);
    setErrorMessage(null);
    // Return focus to trigger
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }
  };

  const openPreferences = (e: React.MouseEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget;
    setErrorMessage(null);
    setIsPreferencesOpen(true);
  };

  const submitConsent = useCallback(
    async (
      decision: "ACCEPT_ALL" | "REJECT_ALL" | "CUSTOM",
      choices: { preferences: boolean; analytics: boolean }
    ) => {
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            preferences: choices.preferences,
            analytics: choices.analytics,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to record consent");
        }

        // Successfully recorded
        setPreferencesOptIn(choices.preferences);
        setAnalyticsOptIn(choices.analytics);
        setIsBannerVisible(false);
        setIsPreferencesOpen(false);
        setLastFailedAction(null);

        // Notify app components if needed
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("pulsesocial_consent_updated", { detail: data.consent })
          );
        }
      } catch (err: unknown) {
        const msg = (err as Error).message || "Network error. Could not reach server.";
        setErrorMessage(
          `Unable to save your privacy choices: ${msg}. Your preferences have not been altered.`
        );
        // Store retry action
        setLastFailedAction(() => () => submitConsent(decision, choices));
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const handleRejectAll = () => {
    submitConsent("REJECT_ALL", { preferences: false, analytics: false });
  };

  const handleAcceptAll = () => {
    submitConsent("ACCEPT_ALL", { preferences: true, analytics: true });
  };

  const handleSaveChoices = () => {
    submitConsent("CUSTOM", {
      preferences: preferencesOptIn,
      analytics: analyticsOptIn,
    });
  };

  const toggleCategoryExpander = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* =========================================================================
          1) COMPACT BANNER (FIRST VISIT ONLY)
          - region with aria-label="Cookie consent"
          - Early in DOM order, non-blocking
          - Desktop (>=1024px): floating card max-width 1100px, radius 16, subtle border/shadow
          - Phone (<640px): bottom sheet, full width, safe-area-inset-bottom
          - Slide-up 200ms, disabled under prefers-reduced-motion
          - Reject all and Accept all MUST have identical size, font-weight, border and visual prominence
         ========================================================================= */}
      {isBannerVisible && (
        <aside
          aria-label="Cookie consent"
          role="region"
          data-hydrated={isMounted ? "true" : undefined}
          className="fixed bottom-0 sm:bottom-4 inset-x-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:w-[calc(100%-32px)] sm:max-w-[1100px] bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 sm:rounded-2xl shadow-xl transition-transform duration-200 ease-out motion-reduce:transition-none pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4 pt-4 px-4 sm:px-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#5846A8] dark:text-purple-400 shrink-0" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Your privacy choices
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We use essential cookies to keep you signed in and secure. With your permission we
                also use optional cookies to remember your preferences and understand how PulseSocial
                is used. You can change this anytime in Cookie settings.
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-xs">
                <Link
                  href="/cookie-policy"
                  className="text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-purple-300 underline underline-offset-2 font-medium transition"
                >
                  Cookie Policy
                </Link>
                <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                  •
                </span>
                <Link
                  href="/privacy"
                  className="text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-purple-300 underline underline-offset-2 font-medium transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Banner Buttons:
                Reject all & Accept all: Identical size, font weight, border, and visual prominence.
                Customize: Quieter text/outline.
                Mobile: Side-by-side for Reject / Accept, Customize below. */}
            <div className="flex flex-col sm:flex-row lg:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
                <button
                  type="button"
                  id="cookie-reject-all"
                  onClick={handleRejectAll}
                  disabled={isSubmitting}
                  className="cookie-action-btn w-full sm:w-[110px] min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5846A8] focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-xs"
                >
                  Reject all
                </button>

                <button
                  type="button"
                  id="cookie-accept-all"
                  onClick={handleAcceptAll}
                  disabled={isSubmitting}
                  className="cookie-action-btn w-full sm:w-[110px] min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5846A8] focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-xs"
                >
                  Accept all
                </button>
              </div>

              <button
                type="button"
                id="cookie-customize"
                onClick={openPreferences}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#5846A8] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <span>Customize</span>
              </button>
            </div>
          </div>

          {/* Banner Error with Retry */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-between gap-3 text-xs text-red-800 dark:text-red-300"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
              {lastFailedAction && (
                <button
                  type="button"
                  onClick={() => lastFailedAction()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isSubmitting ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </aside>
      )}

      {/* =========================================================================
          2) PREFERENCES DIALOG (MODAL)
          - role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title"
          - Focus trap, Esc closes, returns focus to trigger
          - Desktop: centered modal max-width 640px, backdrop
          - Phone: full-screen sheet
          - Single-source categories & tables
          - Equal weight Reject all / Accept all
          - Error banner with Retry on server failure
         ========================================================================= */}
      {isPreferencesOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            aria-describedby="cookie-preferences-intro"
            className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[640px] bg-white dark:bg-slate-900 sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden focus:outline-none"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="space-y-1">
                <h2
                  id="cookie-preferences-title"
                  className="text-lg font-bold text-slate-900 dark:text-white leading-tight"
                >
                  Cookie preferences
                </h2>
                <p
                  id="cookie-preferences-intro"
                  className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  Manage your consent preferences for optional cookies. Essential cookies remain active to provide core platform services.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  Policy version: <span className="font-semibold">{CURRENT_POLICY_VERSION}</span> • Last updated: {LAST_POLICY_UPDATE}
                </p>
              </div>

              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close preferences dialog"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5846A8]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Error Banner with Retry */}
            {errorMessage && (
              <div
                role="alert"
                className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start justify-between gap-3 text-xs text-red-800 dark:text-red-300 shrink-0"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
                {lastFailedAction && (
                  <button
                    type="button"
                    onClick={() => lastFailedAction()}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSubmitting ? "animate-spin" : ""}`} aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            {/* Category Cards List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {COOKIE_CATEGORIES.map((cat) => {
                const isAlwaysActive = cat.alwaysActive;
                const isChecked =
                  isAlwaysActive ||
                  (cat.id === "preferences" ? preferencesOptIn : analyticsOptIn);

                const handleToggle = () => {
                  if (isAlwaysActive) return;
                  if (cat.id === "preferences") {
                    setPreferencesOptIn((prev) => !prev);
                  } else if (cat.id === "analytics") {
                    setAnalyticsOptIn((prev) => !prev);
                  }
                };

                const isExpanded = Boolean(expandedCategories[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </h3>
                          {isAlwaysActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              Always active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {cat.shortDescription}
                        </p>
                      </div>

                      {/* Accessible Switch with Visible On/Off text & Touch target >= 44px */}
                      <div className="shrink-0 flex items-center">
                        {isAlwaysActive ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 min-h-[44px] px-2 select-none">
                            <span>On</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            id={`switch-${cat.id}`}
                            aria-checked={isChecked}
                            aria-label={`Toggle ${cat.name}`}
                            onClick={handleToggle}
                            disabled={isSubmitting}
                            className="min-h-[44px] min-w-[70px] inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5846A8]"
                          >
                            <span
                              className={`text-xs font-bold select-none ${
                                isChecked
                                  ? "text-[#5846A8] dark:text-purple-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {isChecked ? "On" : "Off"}
                            </span>
                            <span
                              className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                                isChecked ? "bg-[#5846A8]" : "bg-slate-300 dark:bg-slate-700"
                              }`}
                            >
                              <span
                                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                  isChecked ? "translate-x-3" : "translate-x-0"
                                }`}
                              />
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* View Cookies Accordion */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpander(cat.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5846A8] dark:text-purple-400 hover:underline cursor-pointer min-h-[36px]"
                      >
                        <span>
                          {isExpanded ? "Hide cookies" : `View cookies (${cat.cookies.length})`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                                <th className="py-2 px-3">Name</th>
                                <th className="py-2 px-3">Purpose</th>
                                <th className="py-2 px-3">Duration</th>
                                <th className="py-2 px-3">Party</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                              {cat.cookies.map((c) => (
                                <tr key={c.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="py-2 px-3 font-mono text-[#5846A8] dark:text-purple-400 font-semibold text-[11px]">
                                    {c.name}
                                  </td>
                                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                                    {c.purpose}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                    {c.duration}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                    {c.firstParty ? "First-party" : "Third-party"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons:
                [Reject all] [Save my choices] [Accept all]
                Reject all and Accept all MUST have equal visual prominence! */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                id="dialog-reject-all"
                onClick={handleRejectAll}
                disabled={isSubmitting}
                className="cookie-dialog-action-btn w-full sm:w-[120px] min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5846A8] shadow-xs"
              >
                Reject all
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  id="dialog-save-choices"
                  onClick={handleSaveChoices}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5846A8] hover:bg-[#48388d] text-white transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5846A8] shadow-xs"
                >
                  Save my choices
                </button>

                <button
                  type="button"
                  id="dialog-accept-all"
                  onClick={handleAcceptAll}
                  disabled={isSubmitting}
                  className="cookie-dialog-action-btn w-full sm:w-[120px] min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5846A8] shadow-xs"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
