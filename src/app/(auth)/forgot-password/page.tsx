"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Send,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  Loader2,
  XCircle,
  KeyRound,
} from "lucide-react";
import { OtpSixBoxInput } from "@/components/auth/OtpSixBoxInput";
import { OtpTopBanner, maskEmail } from "@/components/auth/OtpTopBanner";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [showOtpBanner, setShowOtpBanner] = useState(false);

  // 5-minute countdown timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  // 60-second resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  // Handle 5-minute expiry countdown
  useEffect(() => {
    if (step !== "reset" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Handle 60-second resend cooldown
  useEffect(() => {
    if (step !== "reset" || cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Step 1: Request 6-digit OTP code to email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send OTP. Please try again.");
      }

      setTimeLeft(300); // 5 minutes
      setCooldown(60); // 60s cooldown
      setStep("reset");
      setShowOtpBanner(true);

      toast({
        title: "OTP sent successfully",
        message: `Verification code sent to ${maskEmail(trimmed)}`,
        type: "success",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Unable to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send OTP. Please try again.");

      setTimeLeft(300);
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      setShowOtpBanner(true);

      toast({
        title: "Fresh Code Sent",
        message: `A new 6-digit code has been sent to your email.`,
        type: "info",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Unable to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit OTP code + New Password
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const code = digits.join("").trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      triggerShake();
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      triggerShake();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setStep("success");
      setShowOtpBanner(false);
      toast({
        title: "Password Updated!",
        message: "Your new password has been saved securely.",
        type: "success",
      });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Invalid verification code");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Top Success Banner visible at viewport top without scrolling */}
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
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <PulseSocialLogo size="md" variant="full" href="/" />

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#5846a8] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Center Form Container */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-8">
            {/* Error Banner */}
            {errorMessage && (
              <div
                className={`mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in ${
                  shake ? "animate-shake" : ""
                }`}
              >
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 1: Enter Email                                            */}
            {/* ============================================================== */}
            {step === "email" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[#5846a8]/10 border border-[#5846a8]/20 flex items-center justify-center text-[#5846a8] mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    Enter your registered email address and we will dispatch a 6-digit verification code with a 5-minute validity window.
                  </p>
                </div>

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#5846a8] hover:bg-[#4b3b91] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Recovery Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs text-[#5846a8] font-semibold hover:underline"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: Enter 6-digit Code + Set New Password                  */}
            {/* ============================================================== */}
            {step === "reset" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#2563eb] mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                    Enter code &amp; set password
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We sent a 6-digit code to{" "}
                    <strong className="text-slate-800 font-semibold font-mono">
                      {maskEmail(email)}
                    </strong>
                  </p>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 pt-1">
                    <span>Code expires in:</span>
                    <span className="font-bold text-[#2563eb]">{formatTimer(timeLeft)}</span>
                  </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* 6-Box Discrete OTP Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block text-center">
                      6-Digit Verification Code
                    </label>
                    <OtpSixBoxInput
                      digits={digits}
                      setDigits={setDigits}
                      disabled={isLoading}
                      autoFocus={true}
                      idPrefix="forgot-otp"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
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
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5846a8] focus:ring-2 focus:ring-[#5846a8]/20 transition"
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

                  {/* Submit Reset Button */}
                  <button
                    type="submit"
                    disabled={isLoading || digits.join("").length !== 6 || !newPassword || !confirmPassword}
                    className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#5846a8] hover:bg-[#4b3b91] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown Action */}
                  <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <span>Didn&apos;t receive code?</span>
                    {cooldown > 0 ? (
                      <span className="font-semibold text-slate-600">
                        Resend in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleResendCode}
                        className="text-[#2563eb] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Resend code</span>
                        {isLoading && <RotateCw className="w-3 h-3 animate-spin" />}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: Success Confirmation                                   */}
            {/* ============================================================== */}
            {step === "success" && (
              <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Your account password has been updated securely. You can now log in to your PulseSocial workspace.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#5846a8] hover:bg-[#4b3b91] text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] inline-flex items-center justify-center gap-2"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
        {/* RIGHT COLUMN: Purple Customer Support Illustration (Matching) */}
        {/* ============================================================ */}
        <div className="hidden md:flex w-1/2 bg-[#9674D4] min-h-screen items-center justify-center p-8 lg:p-14 relative overflow-hidden select-none">
          <div className="w-full max-w-[540px] aspect-[4/3.8] relative flex items-center justify-center">
            <svg
              viewBox="0 0 540 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-2xl"
            >
              <defs>
                <linearGradient id="fpScreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E1B2E" />
                  <stop offset="100%" stopColor="#2E284A" />
                </linearGradient>
                <linearGradient id="fpShirtGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C4EA8" />
                  <stop offset="100%" stopColor="#553A8C" />
                </linearGradient>
                <filter id="fpSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background floating icons */}
              <g stroke="#E8DCFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
                <path d="M70 120 C70 105 85 95 105 95 L145 95 C165 95 180 105 180 120 L180 155 C180 165 170 170 155 170 L115 170 L85 190 L90 170 L80 170 C70 170 70 160 70 155 Z" />
                <line x1="125" y1="125" x2="125" y2="155" strokeWidth="2.5" />
                <circle cx="125" cy="115" r="1.5" fill="#E8DCFF" />

                <path d="M250 145 C250 115 270 95 300 95 C330 95 350 115 350 145" />
                <rect x="240" y="140" width="14" height="24" rx="7" />
                <rect x="346" y="140" width="14" height="24" rx="7" />

                <rect x="420" y="130" width="45" height="30" rx="15" />
                <circle cx="432" cy="145" r="2" fill="#E8DCFF" />
                <circle cx="442" cy="145" r="2" fill="#E8DCFF" />
                <circle cx="452" cy="145" r="2" fill="#E8DCFF" />

                <circle cx="95" cy="280" r="32" />
                <ellipse cx="95" cy="280" rx="16" ry="32" />
                <line x1="63" y1="280" x2="127" y2="280" />
                <rect x="80" y="270" width="30" height="20" rx="6" fill="#9674D4" />
                <text x="95" y="284" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">24</text>

                <rect x="380" y="220" width="55" height="36" rx="4" />
                <path d="M370 256 L445 256" strokeWidth="2" />

                <rect x="80" y="380" width="46" height="32" rx="4" />
                <path d="M80 380 L103 400 L126 380" />

                <path d="M430 290 C430 280 445 280 445 290 C445 300 435 305 435 315" />
                <circle cx="435" cy="325" r="1.5" fill="#E8DCFF" />

                <path d="M420 365 L445 365 C450 365 455 355 450 350 L435 340 L420 340" />

                <path d="M190 80 L190 90 M185 85 L195 85" />
                <path d="M410 80 L410 90 M405 85 L415 85" />
                <path d="M210 200 L210 210 M205 205 L215 205" />
                <path d="M360 380 L360 390 M355 385 L365 385" />
                <circle cx="390" cy="85" r="4" />
                <circle cx="160" cy="220" r="3" />
                <circle cx="450" cy="410" r="3" />
              </g>

              {/* Monitor */}
              <ellipse cx="270" cy="460" rx="90" ry="12" fill="#EADFFF" opacity="0.8" />
              <path d="M255 410 L250 455 L290 455 L285 410 Z" fill="#EADFFF" />
              <rect
                x="145"
                y="190"
                width="290"
                height="225"
                rx="24"
                fill="url(#fpScreenGrad)"
                stroke="#EADFFF"
                strokeWidth="5"
              />

              {/* Verified check badge */}
              <g transform="translate(115, 250)">
                <circle cx="28" cy="28" r="28" fill="#FFFFFF" filter="url(#fpSoftGlow)" />
                <path
                  d="M20 28 L26 34 L36 21"
                  stroke="#5846A8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Specialist figure */}
              <path
                d="M205 410 C205 320 240 300 270 300 C300 300 335 320 335 410 Z"
                fill="url(#fpShirtGrad)"
              />
              <path
                d="M240 230 C220 220 200 240 205 275 C210 310 225 330 245 335 C235 300 240 260 250 245 Z"
                fill="#111119"
              />
              <path
                d="M295 230 C315 220 335 240 330 275 C325 310 310 330 290 335 C300 300 295 260 285 245 Z"
                fill="#111119"
              />
              <rect x="260" y="275" width="20" height="30" fill="#FFFFFF" rx="4" />
              <ellipse cx="270" cy="260" rx="20" ry="26" fill="#FFFFFF" />
              <path
                d="M245 250 C245 220 260 215 270 215 C285 215 300 220 295 250 C285 235 265 235 245 250 Z"
                fill="#111119"
              />
              <path d="M255 245 C255 230 265 225 275 225 C285 225 292 232 292 245" stroke="#2D283E" strokeWidth="2.5" />
              <rect x="286" y="245" width="6" height="12" rx="3" fill="#2D283E" />
              <path d="M290 255 L275 268" stroke="#2D283E" strokeWidth="2" strokeLinecap="round" />
              <circle cx="273" cy="269" r="2.5" fill="#2D283E" />

              {/* Hand with OK gesture */}
              <path
                d="M205 410 C195 385 190 355 190 320 C190 290 195 260 198 240"
                stroke="#FFFFFF"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="204" cy="235" r="9" fill="#FFFFFF" stroke="#6C4EA8" strokeWidth="3" />
              <line x1="192" y1="230" x2="188" y2="205" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="200" y1="228" x2="200" y2="200" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="208" y1="230" x2="212" y2="205" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

              {/* Bottom pulse waves */}
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
