"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { OtpSixBoxInput } from "@/components/auth/OtpSixBoxInput";
import { OtpTopBanner, maskEmail } from "@/components/auth/OtpTopBanner";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Auth step: "credentials" (Email + Password) or "otp" (6-box OTP verification)
  const [authStep, setAuthStep] = useState<"credentials" | "otp">("credentials");

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

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const initialEmail = searchParams.get("email");
    const initialUserId = searchParams.get("userId");
    const stepParam = searchParams.get("step");

    if (initialEmail) {
      setEmail(initialEmail);
      setOtpEmail(initialEmail);
    }
    if (initialUserId) {
      setOtpUserId(initialUserId);
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
  }, [searchParams]);

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
  const handleRequestOtpLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address first.");
      triggerShake();
      return;
    }

    setErrorMessage("");
    setIsOtpSending(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send OTP. Please try again.");
      }

      setOtpUserId(data.userId || "");
      setOtpEmail(data.email || trimmedEmail);
      setDigits(["", "", "", "", "", ""]);
      setCooldown(60);
      setTimeLeft(300);
      setAuthStep("otp");
      setShowOtpBanner(true);

      toast({
        title: "OTP sent successfully",
        message: `Verification code sent to ${maskEmail(trimmedEmail)}`,
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

      const redirectTarget = searchParams.get("redirectTo") || data.redirectTo || "/dashboard?setup=brand";
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
          redirectTo: searchParams.get("redirectTo") || "/dashboard?setup=brand",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setIsOtpSuccess(true);
      setShowOtpBanner(false);
      toast({
        title: "Identity Verified!",
        message: "Session authenticated successfully. Launching workspace...",
        type: "success",
      });

      setTimeout(() => {
        window.location.href = data.redirectTo || "/dashboard?setup=brand";
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Invalid verification code");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
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

            {authStep === "otp" && (
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
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 mt-2 mb-8 font-normal">
                  Please enter your details
                </p>

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
                      className="text-xs text-[#5846a8] font-semibold hover:underline"
                    >
                      Forgot password
                    </Link>
                  </div>

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#5846a8] hover:bg-[#4b3b91] text-white text-sm font-semibold shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign in</span>
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

                {/* Footer sign up link */}
                <div className="mt-8 text-center text-xs text-slate-500">
                  <span>Don&apos;t have an account? </span>
                  <Link href="/signup" className="text-[#5846a8] font-semibold hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 2: DYNAMIC 6-BOX OTP VERIFICATION (MATCHING IMAGE)   */}
            {/* -------------------------------------------------------- */}
            {authStep === "otp" && (
              <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-2">
                {/* Circular Blue Shield Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-[#2563eb] mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30">
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
                  We have sent a code to your email
                </p>
                <div className="font-semibold text-xs text-slate-700 mt-0.5 tracking-wide">
                  {maskedEmailText}
                </div>

                {/* 5-Minute Expiry Countdown Timer */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 mt-2 mb-4">
                  <span>Code expires in:</span>
                  <span className="font-bold text-[#2563eb]">{formatTimer(timeLeft)}</span>
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

                  {/* Submit Button ("Verify") */}
                  <button
                    type="submit"
                    disabled={isLoading || isOtpSuccess || digits.join("").length !== 6}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : isOtpSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Verified! Launching...</span>
                      </>
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                </form>

                {/* Bottom text matching reference image */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <span>Didn&apos;t recieve code?</span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="font-semibold text-[#2563eb] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}</span>
                    {isLoading && <RotateCw className="w-3 h-3 animate-spin" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simple Bottom Copyright */}
          <div className="text-center text-[11px] text-slate-400">
            © 2026 PulseSocial Corporation. All rights reserved.
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Purple Customer Success Illustration (Image 1) */}
        {/* ============================================================ */}
        <div className="hidden md:flex w-1/2 bg-[#9674D4] min-h-screen items-center justify-center p-8 lg:p-14 relative overflow-hidden select-none">
          {/* Main Computer Screen with Customer Support Specialist */}
          <div className="w-full max-w-[540px] aspect-[4/3.8] relative flex items-center justify-center">
            <svg
              viewBox="0 0 540 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-2xl"
            >
              <defs>
                {/* Screen inner gradient */}
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E1B2E" />
                  <stop offset="100%" stopColor="#2E284A" />
                </linearGradient>
                {/* Specialist clothes purple */}
                <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C4EA8" />
                  <stop offset="100%" stopColor="#553A8C" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* ---------------------------------------------------- */}
              {/* BACKGROUND FLOATING SOCIAL / TECH OUTLINE ICONS      */}
              {/* ---------------------------------------------------- */}
              <g stroke="#E8DCFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
                {/* Top Left: Chat with 'i' */}
                <path d="M70 120 C70 105 85 95 105 95 L145 95 C165 95 180 105 180 120 L180 155 C180 165 170 170 155 170 L115 170 L85 190 L90 170 L80 170 C70 170 70 160 70 155 Z" />
                <line x1="125" y1="125" x2="125" y2="155" strokeWidth="2.5" />
                <circle cx="125" cy="115" r="1.5" fill="#E8DCFF" />

                {/* Top Center: Headset */}
                <path d="M250 145 C250 115 270 95 300 95 C330 95 350 115 350 145" />
                <rect x="240" y="140" width="14" height="24" rx="7" />
                <rect x="346" y="140" width="14" height="24" rx="7" />

                {/* Top Right: Message dots */}
                <rect x="420" y="130" width="45" height="30" rx="15" />
                <circle cx="432" cy="145" r="2" fill="#E8DCFF" />
                <circle cx="442" cy="145" r="2" fill="#E8DCFF" />
                <circle cx="452" cy="145" r="2" fill="#E8DCFF" />

                {/* Center Left: 24/7 Global Globe */}
                <circle cx="95" cy="280" r="32" />
                <ellipse cx="95" cy="280" rx="16" ry="32" />
                <line x1="63" y1="280" x2="127" y2="280" />
                <rect x="80" y="270" width="30" height="20" rx="6" fill="#9674D4" />
                <text x="95" y="284" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">24</text>

                {/* Mid Right: Laptop outline */}
                <rect x="380" y="220" width="55" height="36" rx="4" />
                <path d="M370 256 L445 256" strokeWidth="2" />

                {/* Envelope */}
                <rect x="80" y="380" width="46" height="32" rx="4" />
                <path d="M80 380 L103 400 L126 380" />

                {/* Question mark / idea */}
                <path d="M430 290 C430 280 445 280 445 290 C445 300 435 305 435 315" />
                <circle cx="435" cy="325" r="1.5" fill="#E8DCFF" />

                {/* Hand / Partnership icon */}
                <path d="M420 365 L445 365 C450 365 455 355 450 350 L435 340 L420 340" />

                {/* Sparkles and plus crosses around */}
                <path d="M190 80 L190 90 M185 85 L195 85" />
                <path d="M410 80 L410 90 M405 85 L415 85" />
                <path d="M210 200 L210 210 M205 205 L215 205" />
                <path d="M360 380 L360 390 M355 385 L365 385" />
                <circle cx="390" cy="85" r="4" />
                <circle cx="160" cy="220" r="3" />
                <circle cx="450" cy="410" r="3" />
              </g>

              {/* ---------------------------------------------------- */}
              {/* COMPUTER SCREEN DISPLAY                              */}
              {/* ---------------------------------------------------- */}
              {/* Monitor Stand Base */}
              <ellipse cx="270" cy="460" rx="90" ry="12" fill="#EADFFF" opacity="0.8" />
              <path d="M255 410 L250 455 L290 455 L285 410 Z" fill="#EADFFF" />

              {/* Monitor Main Frame (rounded rectangle screen) */}
              <rect
                x="145"
                y="190"
                width="290"
                height="225"
                rx="24"
                fill="url(#screenGrad)"
                stroke="#EADFFF"
                strokeWidth="5"
              />

              {/* Verified Checkmark Badge on screen left */}
              <g transform="translate(115, 250)">
                <circle cx="28" cy="28" r="28" fill="#FFFFFF" filter="url(#softGlow)" />
                <path
                  d="M20 28 L26 34 L36 21"
                  stroke="#5846A8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* ---------------------------------------------------- */}
              {/* CUSTOMER SUPPORT SPECIALIST FIGURE                   */}
              {/* ---------------------------------------------------- */}
              {/* Woman Torso / Shirt */}
              <path
                d="M205 410 C205 320 240 300 270 300 C300 300 335 320 335 410 Z"
                fill="url(#shirtGrad)"
              />

              {/* Stylized Black Hair Background */}
              <path
                d="M240 230 C220 220 200 240 205 275 C210 310 225 330 245 335 C235 300 240 260 250 245 Z"
                fill="#111119"
              />
              <path
                d="M295 230 C315 220 335 240 330 275 C325 310 310 330 290 335 C300 300 295 260 285 245 Z"
                fill="#111119"
              />

              {/* Neck and Face */}
              <rect x="260" y="275" width="20" height="30" fill="#FFFFFF" rx="4" />
              <ellipse cx="270" cy="260" rx="20" ry="26" fill="#FFFFFF" />

              {/* Hair Top / Bangs */}
              <path
                d="M245 250 C245 220 260 215 270 215 C285 215 300 220 295 250 C285 235 265 235 245 250 Z"
                fill="#111119"
              />

              {/* Headset on Specialist */}
              <path d="M255 245 C255 230 265 225 275 225 C285 225 292 232 292 245" stroke="#2D283E" strokeWidth="2.5" />
              <rect x="286" y="245" width="6" height="12" rx="3" fill="#2D283E" />
              <path d="M290 255 L275 268" stroke="#2D283E" strokeWidth="2" strokeLinecap="round" />
              <circle cx="273" cy="269" r="2.5" fill="#2D283E" />

              {/* Left Arm & Hand making the 'OK' gesture (👌) */}
              <path
                d="M205 410 C195 385 190 355 190 320 C190 290 195 260 198 240"
                stroke="#FFFFFF"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />
              {/* Hand with OK symbol */}
              <circle cx="204" cy="235" r="9" fill="#FFFFFF" stroke="#6C4EA8" strokeWidth="3" />
              {/* 3 Raised fingers */}
              <line x1="192" y1="230" x2="188" y2="205" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="200" y1="228" x2="200" y2="200" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="208" y1="230" x2="212" y2="205" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

              {/* Bottom wavy pulse lines at bottom of monitor */}
              <path
                d="M125 390 C135 380 145 400 155 390 C165 380 175 400 185 390"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M400 395 C410 385 420 405 430 395 C440 385 450 405 460 395"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}
