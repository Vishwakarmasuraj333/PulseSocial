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
  Check,
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
                      className="text-xs text-[#8F74BD] font-semibold hover:underline"
                    >
                      Forgot password
                    </Link>
                  </div>

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#A38ACD] hover:bg-[#8F74BD] text-white text-sm font-semibold shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
                  <Link href="/signup" className="text-[#8F74BD] font-semibold hover:underline">
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
            © 777% PulseSocial Corporation. All rights reserved.
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: All Social App Link Social Management (Image 1) */}
        {/* ============================================================ */}
        <div className="hidden md:flex w-1/2 bg-[#9674D4] min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden select-none">
          {/* ---------------------------------------------------- */}
          {/* FLOATING OUTLINE ICONS AROUND TABLET                  */}
          {/* ---------------------------------------------------- */}
          {/* Top Left: Chat bubble with 'i' */}
          <div className="absolute left-6 lg:left-14 top-14 opacity-75">
            <svg width="44" height="40" viewBox="0 0 46 42" fill="none" stroke="#EAE0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 5 C5 2 7 1 12 1 L34 1 C39 1 41 2 41 5 L41 27 C41 30 39 31 34 31 L20 31 L12 39 L13 31 L8 31 C6 31 5 30 5 27 Z" />
              <line x1="23" y1="12" x2="23" y2="23" strokeWidth="2.5" />
              <circle cx="23" cy="8" r="1.5" fill="#EAE0FF" stroke="none" />
            </svg>
          </div>

          {/* Mid Left: 24/7 Support Globe */}
          <div className="absolute left-4 lg:left-10 top-1/2 -translate-y-16 opacity-75">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" fill="none" stroke="#EAE0FF" strokeWidth="1.8" className="w-full h-full">
                <circle cx="28" cy="28" r="24" />
                <ellipse cx="28" cy="28" rx="12" ry="24" />
                <line x1="4" y1="28" x2="52" y2="28" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-[#9674D4] px-1 text-[11px] font-bold text-white tracking-wider border border-white/60 rounded">24</span>
              </div>
            </div>
          </div>

          {/* Lower Left: Analytics Bar & Line Chart Card */}
          <div className="absolute left-6 lg:left-14 bottom-16 opacity-75">
            <div className="w-16 h-12 rounded-lg border-2 border-[#EAE0FF] p-1.5 flex flex-col justify-between">
              <svg viewBox="0 0 50 30" fill="none" stroke="#EAE0FF" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 22 L14 16 L24 20 L36 8 L46 12" />
                <line x1="10" y1="28" x2="10" y2="24" strokeWidth="3" />
                <line x1="20" y1="28" x2="20" y2="22" strokeWidth="3" />
                <line x1="30" y1="28" x2="30" y2="18" strokeWidth="3" />
                <line x1="40" y1="28" x2="40" y2="14" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Top Right: Speech bubble with dots */}
          <div className="absolute right-6 lg:left-auto lg:right-14 top-14 opacity-75">
            <svg width="44" height="34" viewBox="0 0 44 34" fill="none" stroke="#EAE0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="40" height="26" rx="13" />
              <circle cx="15" cy="15" r="2" fill="#EAE0FF" stroke="none" />
              <circle cx="22" cy="15" r="2" fill="#EAE0FF" stroke="none" />
              <circle cx="29" cy="15" r="2" fill="#EAE0FF" stroke="none" />
            </svg>
          </div>

          {/* Mid Right: Headset */}
          <div className="absolute right-4 lg:right-10 top-1/2 -translate-y-16 opacity-75">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="#EAE0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 24 C10 14 16 7 23 7 C30 7 36 14 36 24" />
              <rect x="6" y="22" width="7" height="14" rx="3.5" />
              <rect x="33" y="22" width="7" height="14" rx="3.5" />
              <path d="M33 33 C33 39 27 41 23 41" />
              <circle cx="21" cy="41" r="2" fill="#EAE0FF" stroke="none" />
            </svg>
          </div>

          {/* Lower Right: Schedule Calendar */}
          <div className="absolute right-6 lg:right-14 bottom-16 opacity-75">
            <div className="w-14 h-14 rounded-xl border-2 border-[#EAE0FF] p-1.5 flex flex-col justify-between">
              <div className="border-b border-[#EAE0FF] pb-1 flex justify-between items-center text-[7.5px] font-bold text-white uppercase tracking-wider">
                <span>Schedule</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="w-2 h-2 rounded-2xs bg-white/60" />
                <div className="w-2 h-2 rounded-2xs bg-white/60" />
                <div className="w-2 h-2 rounded-2xs bg-white/90" />
                <div className="w-2 h-2 rounded-2xs bg-white/60" />
                <div className="w-2 h-2 rounded-2xs bg-white/90" />
                <div className="w-2 h-2 rounded-2xs bg-white/60" />
              </div>
            </div>
          </div>

          {/* Bottom Right Corner: 4-Pointed Sparkle Star */}
          <div className="absolute right-12 bottom-6 opacity-80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#EAE0FF">
              <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
            </svg>
          </div>

          {/* ---------------------------------------------------- */}
          {/* MAIN VISUAL COLUMN: TITLE + TABLET + OVERLAPPING MONITOR */}
          {/* ---------------------------------------------------- */}
          <div className="w-full max-w-[560px] flex flex-col items-center relative z-10 pb-8">
            {/* Header: All Social App Link Social Management */}
            <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-8 text-center drop-shadow-sm">
              All Social App Link Social Management
            </h2>

            {/* Tablet Frame */}
            <div className="relative w-full rounded-[30px] border-2 border-white/70 p-5 bg-white/10 backdrop-blur-xs shadow-2xl">
              {/* 3x3 Grid of 9 Social Connection Cards */}
              <div className="grid grid-cols-3 gap-3.5">
                {/* 1. LinkedIn */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 2. Twitter / X */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <XIcon className="w-4 h-4 text-black" />
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">•••</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 3. Instagram */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <InstagramIcon className="w-5 h-5" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 4. Facebook */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 5. Pinterest */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <PinterestIcon className="w-5 h-5" />
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">•••</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 6. TikTok */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <TikTokIcon className="w-5 h-5 text-black" />
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">+</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 7. Threads */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <ThreadsIcon className="w-5 h-5 text-black" />
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">•••</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 8. WhatsApp */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>

                {/* 9. Snapchat */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <SnapchatIcon className="w-5 h-5 text-[#FFFC00]" />
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">+</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
                  </div>
                </div>
              </div>

              {/* OVERLAPPING COMPUTER MONITOR WITH SPECIALIST & FLOATING BADGE */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[270px] sm:w-[290px] drop-shadow-2xl z-20">
                <div className="relative">
                  {/* Floating Circular Checkmark Badge on left */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white z-30">
                    <Check className="w-5 h-5 text-[#8F74BD] stroke-[3]" />
                  </div>

                  {/* Monitor SVG */}
                  <svg viewBox="0 0 290 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                    <defs>
                      <linearGradient id="monitorScreenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E1738" />
                        <stop offset="100%" stopColor="#2A1F4E" />
                      </linearGradient>
                      <linearGradient id="specialistShirt" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6C4EA8" />
                        <stop offset="100%" stopColor="#553A8C" />
                      </linearGradient>
                    </defs>

                    {/* Oval Base & Neck */}
                    <ellipse cx="145" cy="222" rx="65" ry="7" fill="#FFFFFF" />
                    <path d="M135 186 L130 220 L160 220 L155 186 Z" fill="#FFFFFF" />

                    {/* Monitor Screen Frame (White rounded bezel) */}
                    <rect x="25" y="10" width="240" height="178" rx="20" fill="url(#monitorScreenGrad)" stroke="#FFFFFF" strokeWidth="5" />

                    {/* Customer Support Specialist Character */}
                    {/* Torso / Purple Shirt */}
                    <path d="M90 186 C90 128 115 110 145 110 C175 110 200 128 200 186 Z" fill="url(#specialistShirt)" />

                    {/* Stylized Twin Pigtails / Buns (Black Hair) */}
                    <circle cx="118" cy="62" r="14" fill="#111119" />
                    <circle cx="172" cy="62" r="14" fill="#111119" />

                    {/* Neck and Head */}
                    <rect x="139" y="88" width="12" height="20" fill="#FFFFFF" rx="2" />
                    <ellipse cx="145" cy="74" rx="16" ry="20" fill="#FFFFFF" />

                    {/* Hair Front / Bangs */}
                    <path d="M129 70 C129 55 140 50 145 50 C155 50 161 55 161 70 C154 62 136 62 129 70 Z" fill="#111119" />

                    {/* Friendly Smile & Facial features */}
                    <circle cx="139" cy="73" r="1.5" fill="#2E284A" />
                    <circle cx="151" cy="73" r="1.5" fill="#2E284A" />
                    <path d="M141 80 Q145 83 149 80" stroke="#2E284A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                    {/* Left Arm & Hand Raised Making Peace / Wave Symbol */}
                    <path d="M96 186 C88 165 85 140 85 115 C85 92 89 75 92 62" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" fill="none" />
                    <circle cx="94" cy="58" r="6" fill="#FFFFFF" />
                    <line x1="88" y1="56" x2="85" y2="40" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="94" y1="54" x2="94" y2="36" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="100" y1="56" x2="103" y2="40" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
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
