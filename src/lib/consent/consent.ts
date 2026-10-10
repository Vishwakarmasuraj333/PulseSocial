import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  CONSENT_COOKIE_NAME,
  CURRENT_POLICY_VERSION,
  LAST_POLICY_UPDATE,
  COOKIE_CATEGORIES,
} from "./consent-config";

export {
  CONSENT_COOKIE_NAME,
  CURRENT_POLICY_VERSION,
  LAST_POLICY_UPDATE,
  COOKIE_CATEGORIES,
};

export interface CookieConsentState {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing?: boolean;
  decision: "ACCEPT_ALL" | "REJECT_ALL" | "CUSTOM" | "WITHDRAWN";
  policyVersion: string;
  timestamp: string;
}

export function getDefaultConsent(): CookieConsentState {
  return {
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
    decision: "REJECT_ALL",
    policyVersion: CURRENT_POLICY_VERSION,
    timestamp: new Date().toISOString(),
  };
}

export async function getConsentState(): Promise<CookieConsentState | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.policyVersion !== CURRENT_POLICY_VERSION) {
      // Outdated policy version: requires re-consent
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function generateVisitorId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function recordConsent(params: {
  userId?: string | null;
  visitorId?: string;
  preferences: boolean;
  analytics: boolean;
  marketing?: boolean;
  decision: "ACCEPT_ALL" | "REJECT_ALL" | "CUSTOM" | "WITHDRAWN";
  source?: string;
}): Promise<CookieConsentState> {
  const visitorId = params.visitorId || generateVisitorId();
  const timestamp = new Date();
  const marketing = params.marketing ?? false;

  let validUserId: string | undefined = undefined;
  if (params.userId) {
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { id: true },
      });
      if (userExists) validUserId = userExists.id;
    } catch {}
  }

  // Persist consent audit record in PostgreSQL
  await prisma.consentRecord.create({
    data: {
      userId: validUserId,
      visitorId,
      policyVersion: CURRENT_POLICY_VERSION,
      necessary: true,
      preferences: params.preferences,
      analytics: params.analytics,
      marketing,
      decision: params.decision,
      source: params.source || "web_banner",
      timestamp,
    },
  });

  const state: CookieConsentState = {
    necessary: true,
    preferences: params.preferences,
    analytics: params.analytics,
    marketing,
    decision: params.decision,
    policyVersion: CURRENT_POLICY_VERSION,
    timestamp: timestamp.toISOString(),
  };

  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set(CONSENT_COOKIE_NAME, JSON.stringify(state), {
      httpOnly: false, // Accessible client-side for UI banner state
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    // If rejecting or withdrawing, remove any existing telemetry cookies
    if (!params.analytics) {
      cookieStore.delete("_pk_id");
      cookieStore.delete("_pk_ses");
      cookieStore.delete("_ga");
      cookieStore.delete("_gid");
    }
    if (!params.preferences) {
      cookieStore.delete("pulsesocial_theme");
      cookieStore.delete("pulsesocial_active_brand");
    }
  } catch {
    // Graceful fallback when invoked outside Next.js request context
  }

  return state;
}

export async function withdrawConsent(
  userId?: string | null,
  visitorId?: string
): Promise<CookieConsentState> {
  return recordConsent({
    userId,
    visitorId,
    preferences: false,
    analytics: false,
    marketing: false,
    decision: "WITHDRAWN",
    source: "settings_modal",
  });
}
