"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Check,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { OtpSixBoxInput } from "@/components/auth/OtpSixBoxInput";
import { OtpTopBanner, maskEmail } from "@/components/auth/OtpTopBanner";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  TikTokIcon,
  WhatsAppIcon,
  SnapchatIcon,
  ThreadsIcon,
  PinterestIcon,
} from "@/components/icons/PlatformIcons";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const getRedirectTarget = () => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("redirectTo") || "/dashboard";
    }
    return "/dashboard";
  };

  // Flip animation state when navigating to /signup or toggling 3D preview
  const [isFlipping, setIsFlipping] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const handleNavigateToSignup = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsFlipping(true);
    setTimeout(() => {
      router.push("/signup");
    }, 320);
  };

  // Auth step: "credentials" (Email + Password or Direct OTP) or "otp" (6-box OTP verification)
  const [authStep, setAuthStep] = useState<"credentials" | "otp">("credentials");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpUserId, setOtpUserId] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [showOtpBanner, setShowOtpBanner] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingUser, setExistingUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "true") {
        setExistingUser(null);
        try {
          localStorage.removeItem("pulsesocial_active_user");
          localStorage.removeItem("pulsesocial_active_brand");
          sessionStorage.clear();
        } catch {}

        const cookieNames = ["pulsesocial_auth_session", "pulsesocial_session", "next-auth.session-token"];
        cookieNames.forEach((name) => {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
          if (window.location.hostname) {
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
          }
        });

        fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
        window.dispatchEvent(new Event("pulsesocial_auth_changed"));
        return;
      }
    }

    fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setExistingUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSignOutCurrent = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setExistingUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("pulsesocial_active_user");
        localStorage.removeItem("pulsesocial_active_brand");
        sessionStorage.clear();
      } catch {}

      const cookieNames = ["pulsesocial_auth_session", "pulsesocial_session", "next-auth.session-token"];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        if (window.location.hostname) {
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        }
      });
      window.dispatchEvent(new Event("pulsesocial_auth_changed"));
    }
    toast({
      title: "Signed Out",
      message: "You have been signed out. Please sign in with your credentials.",
      type: "info",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const message = params.get("message");
    const initialEmail = params.get("email");
    const initialUserId = params.get("userId");
    const stepParam = params.get("step");
    const modeParam = params.get("mode");

    if (initialEmail) {
      setEmail(initialEmail);
      setOtpEmail(initialEmail);
    }
    if (initialUserId) {
      setOtpUserId(initialUserId);
    }
    if (modeParam === "otp") {
      setLoginMethod("otp");
    }
    if (stepParam === "otp" && (initialUserId || initialEmail)) {
      setAuthStep("otp");
      setShowOtpBanner(true);
    }

    if (error === "google_not_configured") {
      setErrorMessage(
        message ||
          "Google Sign-In is not configured on this server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables (.env) to enable Google OAuth."
      );
    } else if (error) {
      setErrorMessage(message || "Authentication could not be completed. Please try again.");
    }
  }, []);

  // Auto-fetch dev code when entering OTP step for quick seamless testing
  useEffect(() => {
    if (authStep !== "otp") {
      setDevCode(null);
      return;
    }

    const targetQuery = otpUserId
      ? `userId=${encodeURIComponent(otpUserId)}`
      : `email=${encodeURIComponent(otpEmail || email)}`;

    fetch(`/api/auth/dev-otp?${targetQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.code) {
          setDevCode(data.code);
        }
      })
      .catch(() => {});
  }, [authStep, otpUserId, otpEmail, email]);

  // 60-second Resend Cooldown Timer
  useEffect(() => {
    if (authStep !== "otp" || cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [authStep, cooldown]);

  // 5-minute Expiry Countdown Timer
  useEffect(() => {
    if (authStep !== "otp" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [authStep, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  // ==========================================
  // Direct Sign In with OTP (Passwordless)
  // ==========================================
  const handleRequestOtpLogin = async (explicitEmail?: string) => {
    const targetEmail = (explicitEmail || email).trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address first.");
      triggerShake();
      return;
    }

    if (explicitEmail) {
      setEmail(explicitEmail);
    }

    setErrorMessage("");
    setIsOtpSending(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send OTP. Please try again.");
      }

      setOtpUserId(data.userId || "");
      setOtpEmail(data.email || targetEmail);
      setDigits(["", "", "", "", "", ""]);
      setCooldown(60);
      setTimeLeft(300);
      setAuthStep("otp");
      setShowOtpBanner(true);

      toast({
        title: "Real OTP sent successfully",
        message: `6-digit verification code sent to ${maskEmail(targetEmail)}`,
        type: "success",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Unable to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsOtpSending(false);
    }
  };

  // ==========================================
  // Handle Email + Password Submission
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // If OTP is required (MFA or unverified email)
      if (data.requiresOtp) {
        setOtpUserId(data.userId || "");
        setOtpEmail(data.email || trimmedEmail);
        setDigits(["", "", "", "", "", ""]);
        setCooldown(60);
        setTimeLeft(300); // 5 minutes
        setAuthStep("otp");
        setShowOtpBanner(true);

        toast({
          title: "OTP sent successfully",
          message: `Verification code sent to ${maskEmail(data.email || trimmedEmail)}`,
          type: "success",
        });
        return;
      }

      // Direct login success
      toast({
        title: "Welcome back!",
        message: "Signed in successfully to PulseSocial.",
        type: "success",
      });

      const redirectTarget = getRedirectTarget() || data.redirectTo || "/dashboard?setup=brand";
      window.location.href = redirectTarget;
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Invalid email or password.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Verify 6-Box OTP Submission
  // ==========================================
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || digits.join("")).trim();

    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      triggerShake();
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: otpUserId || undefined,
          email: otpEmail || email.trim() || undefined,
          code,
          redirectTo: getRedirectTarget(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      if (data.user) {
        try {
          localStorage.setItem("pulsesocial_active_user", JSON.stringify(data.user));
        } catch {}
      }

      setIsOtpSuccess(true);
      setShowOtpBanner(false);
      toast({
        title: "Identity Verified!",
        message: "Session authenticated successfully. Launching workspace...",
        type: "success",
      });

      setTimeout(() => {
        window.location.href = getRedirectTarget() || data.redirectTo || "/dashboard";
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Invalid verification code");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillDevCode = () => {
    if (!devCode) return;
    const splitDigits = devCode.slice(0, 6).split("");
    setDigits(splitDigits);
    handleVerifyOtp(devCode);
  };

  // ==========================================
  // Resend OTP Action
  // ==========================================
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: otpUserId || undefined,
          email: otpEmail || email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send OTP. Please try again.");
      }

      setCooldown(60);
      setTimeLeft(300); // Reset to 5 minutes
      setDigits(["", "", "", "", "", ""]);
      setShowOtpBanner(true);

      // Refresh dev code
      const targetQuery = otpUserId
        ? `userId=${encodeURIComponent(otpUserId)}`
        : `email=${encodeURIComponent(otpEmail || email)}`;
      fetch(`/api/auth/dev-otp?${targetQuery}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.code) setDevCode(d.code);
        })
        .catch(() => {});

      toast({
        title: "OTP sent successfully",
        message: `Verification code sent to ${maskEmail(otpEmail || email)}`,
        type: "success",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Unable to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmailText = maskEmail(otpEmail || email);

  return (
    <>
      {/* Top Success Notification Banner */}
      <OtpTopBanner
        show={showOtpBanner}
        email={otpEmail || email}
        onClose={() => setShowOtpBanner(false)}
      />

      <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans selection:bg-purple-600 selection:text-white">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Clean Form Panel matching user's Image 1         */}
        {/* ============================================================ */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen bg-white">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between">
            <PulseSocialLogo size="md" variant="full" href="/" />

            {authStep === "otp" ? (
              <button
                type="button"
                onClick={() => {
                  setAuthStep("credentials");
                  setErrorMessage("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={handleNavigateToSignup}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#5846a8] transition group"
              >
                <span>Don&apos;t have an account? <strong className="text-[#5846a8] group-hover:underline">Sign up</strong></span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Form Content Area */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-8">
            {/* Error Message Alert */}
            {errorMessage && (
              <div
                className={`mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                  shakeError ? "animate-shake" : ""
                }`}
              >
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 1: CREDENTIALS (WELCOME BACK)                       */}
            {/* -------------------------------------------------------- */}
            {authStep === "credentials" && (
              <div className="animate-in fade-in duration-200">
                {/* Switcher Pills between Sign In and Sign Up */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-5 w-fit border border-slate-200/60">
                  <span className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs">
                    Sign In
                  </span>
                  <Link
                    href="/signup"
                    onClick={handleNavigateToSignup}
                    className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 font-semibold text-xs transition inline-flex items-center gap-1"
                  >
                    <span>Sign Up</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 mt-1 mb-5 font-normal">
                  Sign in to access your PulseSocial workspace
                </p>
                {/* Active Session Notification (if already logged in) */}
                {existingUser && (
                  <div className="mb-5 p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-indigo-950 dark:text-indigo-200 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">
                        Signed in as <strong>{existingUser.email}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href="/dashboard"
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow-xs"
                      >
                        Enter Workspace →
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOutCurrent}
                        className="px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold text-[11px] transition cursor-pointer"
                      >
                        Switch Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Professional Auth Method Switcher Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("password");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      loginMethod === "password"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Password Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      loginMethod === "otp"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sign In with Email OTP
                  </button>
                </div>

                {/* FORM: PASSWORD LOGIN */}
                {loginMethod === "password" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email address input */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                    </div>

                    {/* Password input */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot password row */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#5846a8] focus:ring-[#5846a8] cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 font-medium">Remember for 30 days</span>
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs text-[#8F74BD] font-semibold hover:underline"
                      >
                        Forgot password
                      </Link>
                    </div>

                    {/* Sign In button */}
                    <button
                      type="submit"
                      disabled={isLoading || !email.trim() || !password}
                      className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#5846A8] hover:bg-[#48378E] text-white text-sm font-semibold shadow-md transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying & Sending OTP...</span>
                        </>
                      ) : (
                        <span>Sign in (with Email OTP)</span>
                      )}
                    </button>

                    {/* Sign In with Google button */}
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/api/auth/google";
                      }}
                      className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </form>
                ) : (
                  /* FORM: DIRECT EMAIL OTP LOGIN */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRequestOtpLogin();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Your registered email address
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      We'll send a secure 6-digit one-time verification code to this email address. No password required.
                    </p>

                    <button
                      type="submit"
                      disabled={isOtpSending || !email.trim()}
                      className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#5846A8] hover:bg-[#48378E] text-white text-sm font-semibold shadow-md transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isOtpSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending OTP to inbox...</span>
                        </>
                      ) : (
                        <span>Send Verification Code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/api/auth/google";
                      }}
                      className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </form>
                )}

                {/* Footer sign up link */}
                <div className="mt-8 text-center text-xs text-slate-500">
                  <span>Don&apos;t have an account? </span>
                  <Link
                    href="/signup"
                    onClick={handleNavigateToSignup}
                    className="text-[#5846A8] font-bold hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 2: DYNAMIC 6-BOX OTP VERIFICATION                   */}
            {/* -------------------------------------------------------- */}
            {authStep === "otp" && (
              <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-2">
                {/* Circular Blue Shield Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-[#5846A8] mx-auto flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <svg
                    className="w-8 h-8 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-5">
                  Verify your code
                </h1>

                {/* Subtitle with real masked email text */}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  We have sent a verification code to your email
                </p>
                <div className="font-semibold text-xs text-slate-800 mt-0.5 tracking-wide">
                  {maskedEmailText}
                </div>

                {/* 5-Minute Expiry Countdown Timer */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 mt-2 mb-3">
                  <span>Code expires in:</span>
                  <span className="font-bold text-[#5846A8]">{formatTimer(timeLeft)}</span>
                </div>

                {/* The 6-Box OTP Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOtp();
                  }}
                  className="space-y-5"
                >
                  <OtpSixBoxInput
                    digits={digits}
                    setDigits={setDigits}
                    onComplete={(fullCode) => handleVerifyOtp(fullCode)}
                    disabled={isLoading || isOtpSuccess}
                    hasError={Boolean(errorMessage)}
                    autoFocus={true}
                    idPrefix="login-otp"
                  />

                  {/* Submit Button ("Verify & Launch") */}
                  <button
                    type="submit"
                    disabled={isLoading || isOtpSuccess || digits.join("").length !== 6}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#5846A8] hover:bg-[#48378E] text-white text-sm font-semibold shadow-md shadow-purple-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : isOtpSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Verified! Launching Dashboard...</span>
                      </>
                    ) : (
                      <span>Verify & Access Dashboard</span>
                    )}
                  </button>
                </form>

                {/* Bottom text matching reference image */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="font-semibold text-[#5846A8] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}</span>
                    {isLoading && <RotateCw className="w-3 h-3 animate-spin" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simple Bottom Copyright */}
          <div className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} PulseSocial Corporation. All rights reserved.
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Purple Hero with 3D Flip ("Palti") Animation   */}
        {/* ============================================================ */}
        <div className="hidden md:flex w-1/2 bg-[#9371D0] min-h-screen items-center justify-center relative overflow-hidden select-none [perspective:1400px]">
          {/* Interactive 3D Flip Container */}
          <div
            className={`relative w-full h-full max-h-[92vh] max-w-[640px] flex items-center justify-center transition-transform duration-700 [transform-style:preserve-3d] ${
              isFlipping ? "animate-palti-exit" : "animate-palti-enter"
            } ${isCardFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            {/* FRONT FACE: PulseSocial Multi-Channel Purple Hero */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center [backface-visibility:hidden]">
              <img
                src="/images/auth_login_purple_hero.png"
                alt="PulseSocial Secure Multi-Channel Authentication"
                className="w-full h-full max-h-[92vh] max-w-[640px] object-contain select-none pointer-events-none"
              />
            </div>

            {/* BACK FACE: PulseSocial Support Specialist (Signup Hero) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <img
                src="/images/auth_specialist_hero.png"
                alt="PulseSocial Specialist"
                className="w-full h-full max-h-[92vh] max-w-[640px] object-contain select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
