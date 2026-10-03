"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { authService } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  XCircle,
  Mail,
  Lock,
  User,
  CheckCircle2,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { OtpSixBoxInput } from "@/components/auth/OtpSixBoxInput";
import { OtpTopBanner, maskEmail } from "@/components/auth/OtpTopBanner";
import { AuthShowcaseHero } from "@/components/auth/AuthShowcaseHero";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"form" | "otp">("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP state
  const [userId, setUserId] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOtpBanner, setShowOtpBanner] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const message = params.get("message");
    if (error === "google_not_configured") {
      setErrorMessage(
        message ||
          "Google Sign-In is not configured on this server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables (.env) to enable Google OAuth."
      );
    } else if (error) {
      setErrorMessage(message || "Authentication could not be completed. Please try again.");
    }
  }, []);

  // 60-second Resend cooldown
  useEffect(() => {
    if (step !== "otp" || cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // 5-minute expiry timer
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // ==========================================
  // Step 1: Create Account & Dispatch OTP
  // ==========================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      triggerShake();
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("Please accept the Terms of Service & Privacy Policy.");
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.signup({ name: name.trim(), email: trimmedEmail, password });

      setUserId(data.userId || "");
      setDigits(["", "", "", "", "", ""]);
      setCooldown(60);
      setTimeLeft(300);
      setStep("otp");
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
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 2: Verify OTP
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
          userId: userId || undefined,
          email: email.trim().toLowerCase(),
          code,
          redirectTo: "/dashboard?setup=brand",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setIsSuccess(true);
      setShowOtpBanner(false);
      toast({
        title: "Email Verified!",
        message: "Welcome to PulseSocial! Setting up your brand...",
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
  // Resend OTP
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
          userId: userId || undefined,
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send OTP. Please try again.");

      setCooldown(60);
      setTimeLeft(300);
      setDigits(["", "", "", "", "", ""]);
      setShowOtpBanner(true);

      toast({
        title: "OTP sent successfully",
        message: `Verification code sent to ${maskEmail(email)}`,
        type: "success",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Unable to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <>
      {/* Prominent top notification banner */}
      <OtpTopBanner
        show={showOtpBanner}
        email={email}
        onClose={() => setShowOtpBanner(false)}
      />

      <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans selection:bg-[#5846a8] selection:text-white">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Clean Form Panel matching Login Screen           */}
        {/* ============================================================ */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen bg-white">
          {/* Header */}
          <div className="flex items-center justify-between">
            <PulseSocialLogo size="md" variant="full" href="/" />

            {step === "otp" ? (
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setErrorMessage("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#5846a8] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#5846a8] transition"
              >
                <span>Already have an account? Sign in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Center Form Container */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-6">
            {/* Error Message */}
            {errorMessage && (
              <div
                className={`mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                  shake ? "animate-shake" : ""
                }`}
              >
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {step === "form" && (
              <div className="animate-in fade-in duration-200">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Get started with PulseSocial
                </h1>
                <p className="text-sm text-slate-500 mt-2 mb-6 font-normal">
                  Scale your social media workspace with multi-account publishing and analytics.
                </p>

                <form onSubmit={handleSignup} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#5846a8] focus:ring-[#5846a8] cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-slate-600 leading-snug cursor-pointer select-none"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#5846a8] font-semibold hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#5846a8] font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim() || !email.trim() || !password || !agreedToTerms}
                    className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#5846a8] hover:bg-[#4b3b91] text-white text-sm font-semibold shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account &amp; Send OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Google Signup */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
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
                    <span>Continue with Google</span>
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  <span>Already have an account? </span>
                  <Link href="/login" className="text-[#5846a8] font-semibold hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2: 6-Box OTP Verification Form */}
            {step === "otp" && (
              <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-[#2563eb] mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30">
                  {isSuccess ? (
                    <CheckCircle2 className="w-8 h-8 text-white animate-bounce" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-white" />
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-5">
                  Verify your work email
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  We have sent a code to your email
                </p>
                <div className="font-semibold text-xs text-slate-700 mt-0.5 tracking-wide font-mono">
                  {maskEmail(email)}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 mt-2 mb-4">
                  <span>Code expires in:</span>
                  <span className="font-bold text-[#2563eb]">{formatTimer(timeLeft)}</span>
                </div>

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
                    onComplete={(code) => handleVerifyOtp(code)}
                    disabled={isLoading || isSuccess}
                    hasError={Boolean(errorMessage)}
                    autoFocus={true}
                    idPrefix="signup-otp"
                  />

                  <button
                    type="submit"
                    disabled={isLoading || isSuccess || digits.join("").length !== 6}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Verified! Launching...</span>
                      </>
                    ) : (
                      <span>Verify &amp; Create Account</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <span>Didn&apos;t receive code?</span>
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

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400">
            © 2026 PulseSocial Corporation. All rights reserved.
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Ultra-Modern SaaS Showcase Hero                */}
        {/* ============================================================ */}
        <AuthShowcaseHero />
      </div>
    </>
  );
}
