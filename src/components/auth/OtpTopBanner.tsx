"use client";

import React from "react";

interface OtpTopBannerProps {
  show: boolean;
  email: string;
  onClose?: () => void;
  autoCloseMs?: number;
}

export function maskEmail(emailStr: string): string {
  if (!emailStr || !emailStr.includes("@")) return "s***@gmail.com";
  const [local, domain] = emailStr.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  const prefix = local[0];
  const suffix = local.slice(-1);
  return `${prefix}***${suffix}@${domain}`;
}

export function triggerBrowserNotification(_maskedEmail: string) {
  // Silent
}

export function OtpTopBanner(_props: OtpTopBannerProps) {
  // Completely disabled as requested
  return null;
}
