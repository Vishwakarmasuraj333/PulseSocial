"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Loader2, ArrowLeft, RotateCw } from "lucide-react";
import { OtpSixBoxInput } from "@/components/auth/OtpSixBoxInput";

function maskEmail(emailStr: string): string {
  if (!emailStr || !emailStr.includes("@")) {
    return "is***a8@gmail.com";
  }
  const [local, domain] = emailStr.split("@");
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  const prefix = local.slice(0, 2);
  const suffix = local.slice(-2);
  return `${prefix}***${suffix}@${domain}`;
}

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const userId = searchParams.get("userId") || "";
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(300); // Exact 5 minutes (300 seconds)
  const [shake, setShake] = useState(false);

  // 60-second Resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 5-minute expiry timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
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
          email: email || undefined,
          code,
          redirectTo: searchParams.get("redirectTo") || "/dashboard?setup=brand",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      setIsSuccess(true);
      toast({
        title: "Identity Verified!",
        message: "Your PulseSocial session has been established. Setting up your brand...",
        type: "success",
      });

      // Redirect to dashboard brand setup
      setTimeout(() => {
        window.location.href = data.redirectTo || "/dashboard?setup=brand";
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Invalid or expired verification code.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || undefined,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");

      setCooldown(60);
      setTimeLeft(300); // Reset to 5 minutes
      setDigits(["", "", "", "", "", ""]);

      toast({
        title: "Code Dispatched!",
        message: `A fresh 6-digit code has been sent to ${email}`,
        type: "info",
      });
    } catch (err: unknown) {
      toast({
        title: "Resend Failed",
        message: (err as Error).message || "Could not resend code",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmail = maskEmail(email);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#5c98f8] via-[#4787f4] to-[#2f73ed] flex flex-col justify-between items-center py-8 px-4 font-sans relative selection:bg-blue-600 selection:text-white">
      {/* Top back navigation */}
      <div className="w-full max-w-[460px] mx-auto flex items-center justify-between pb-2 relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Frosted Glass Outer Container matching user's image */}
      <div className="my-auto relative z-10 w-full max-w-[430px] p-3 sm:p-4 rounded-[32px] bg-white/20 backdrop-blur-xl border border-white/35 shadow-[0_20px_60px_-15px_rgba(20,45,110,0.35)] animate-in fade-in zoom-in-95 duration-200">
        {/* Crisp White Inner Card */}
        <div className="bg-white rounded-[24px] px-6 py-9 sm:px-8 sm:py-10 shadow-sm text-center">
          {/* Blue Shield Icon Badge */}
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-5">
            Verify your code
          </h1>

          {/* Subtitle with real masked email text */}
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            We have sent a code to your email
          </p>
          <div className="font-semibold text-xs text-slate-700 mt-0.5 tracking-wide">
            {maskedEmail}
          </div>

          {/* 5-Minute Countdown Expiry Timer */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500">
            <span>Code expires in:</span>
            <span className="font-bold text-[#2563eb]">{formatTime(timeLeft)}</span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              className={`mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in duration-150 ${
                shake ? "animate-shake" : ""
              }`}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* 6-Box OTP Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode();
            }}
            className="mt-6 space-y-6"
          >
            <OtpSixBoxInput
              digits={digits}
              setDigits={setDigits}
              onComplete={(code) => handleVerifyCode(code)}
              disabled={isLoading || isSuccess}
              hasError={Boolean(errorMessage)}
              autoFocus={true}
              idPrefix="verify-page-otp"
            />

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess || digits.join("").length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : isSuccess ? (
                <span>Verified! Launching...</span>
              ) : (
                <span>Verify</span>
              )}
            </button>
          </form>

          {/* Didn't receive code? Resend text */}
          <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1">
            <span>Didn&apos;t recieve code?</span>
            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={handleResend}
              className="font-semibold text-[#2563eb] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}</span>
              {isLoading && <RotateCw className="w-3 h-3 animate-spin" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-white/75 mt-4 relative z-10">
        © 2026, PulseSocial Corporation Pvt. Ltd. All Rights Reserved.
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-[#5c98f8] to-[#2f73ed]" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
