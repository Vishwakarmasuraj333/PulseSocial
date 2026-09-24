"use client";

import React, { useRef, useEffect } from "react";

interface OtpSixBoxInputProps {
  digits: string[];
  setDigits?: React.Dispatch<React.SetStateAction<string[]>>;
  onChange?: (digits: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  idPrefix?: string;
}

export function OtpSixBoxInput({
  digits,
  setDigits,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
  idPrefix = "otp-box",
}: OtpSixBoxInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateDigits = (newDigits: string[]) => {
    if (setDigits) setDigits(newDigits);
    if (onChange) onChange(newDigits);
  };

  // Focus the first empty box or box 0 on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIdx = digits.findIndex((d) => !d);
      const targetIdx = firstEmptyIdx === -1 ? 0 : firstEmptyIdx;
      inputRefs.current[targetIdx]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only numeric characters
    const numericVal = rawVal.replace(/\D/g, "");

    if (!numericVal) {
      // Cleared out
      const newDigits = [...digits];
      newDigits[index] = "";
      updateDigits(newDigits);
      return;
    }

    // If multiple characters pasted into single input (edge case)
    if (numericVal.length > 1) {
      handlePastedString(numericVal, index);
      return;
    }

    // Normal single digit input
    const singleDigit = numericVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    updateDigits(newDigits);

    // Auto advance to next box
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }

    // Auto submit if all 6 filled
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && !newDigits.some((d) => !d)) {
      if (onComplete) {
        setTimeout(() => onComplete(fullCode), 60);
      }
    }
  };

  const handlePastedString = (pasted: string, startIndex: number = 0) => {
    const cleanNumbers = pasted.replace(/\D/g, "");
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    const chars = cleanNumbers.slice(0, 6).split("");

    chars.forEach((char, i) => {
      const targetIndex = startIndex + i;
      if (targetIndex < 6) {
        newDigits[targetIndex] = char;
      }
    });

    updateDigits(newDigits);

    // Move focus to next unfilled box or the last box
    const nextUnfilled = newDigits.findIndex((d) => !d);
    if (nextUnfilled !== -1) {
      inputRefs.current[nextUnfilled]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }

    // Trigger complete if full 6 digits
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && !newDigits.some((d) => !d)) {
      if (onComplete) {
        setTimeout(() => onComplete(fullCode), 80);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        updateDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current
        const newDigits = [...digits];
        newDigits[index] = "";
        updateDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    } else if (e.key === "Delete") {
      const newDigits = [...digits];
      newDigits[index] = "";
      updateDigits(newDigits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    handlePastedString(text, 0);
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[380px] mx-auto py-2">
      {digits.map((digit, idx) => {
        const isFilled = Boolean(digit);
        return (
          <div key={idx} className="relative flex-1 aspect-square max-w-[52px]">
            <input
              id={`${idPrefix}-${idx}`}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(idx)}
              aria-label={`Digit ${idx + 1} of 6`}
              className={`w-full h-full text-center text-xl sm:text-2xl font-bold font-mono rounded-xl transition-all duration-150 outline-none select-all
                ${
                  hasError
                    ? "border-2 border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-4 focus:ring-rose-500/20"
                    : isFilled
                    ? "border-2 border-[#1592e6] bg-blue-50/30 text-slate-900 shadow-sm"
                    : "border-2 border-slate-200 bg-slate-50/60 text-slate-900 hover:border-slate-300 focus:border-[#1592e6] focus:bg-white focus:ring-4 focus:ring-[#1592e6]/15"
                }
                ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "cursor-text"}
              `}
            />
            {/* Subtle center indicator line when empty */}
            {!isFilled && !disabled && (
              <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-slate-300 rounded-full pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}
