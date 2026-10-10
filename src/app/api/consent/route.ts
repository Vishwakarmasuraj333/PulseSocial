import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getConsentState,
  recordConsent,
  withdrawConsent,
  getDefaultConsent,
  CONSENT_COOKIE_NAME,
  CURRENT_POLICY_VERSION,
  COOKIE_CATEGORIES,
} from "@/lib/consent/consent";

export async function GET(req?: Request) {
  try {
    const consent = await getConsentState();
    const secGpc =
      req?.headers?.get("Sec-GPC") === "1" ||
      req?.headers?.get("sec-gpc") === "1" ||
      req?.headers?.get("DNT") === "1";

    return NextResponse.json({
      success: true,
      consent: consent || getDefaultConsent(),
      hasExplicitConsent: Boolean(consent),
      secGpcActive: secGpc,
      policyVersion: CURRENT_POLICY_VERSION,
      categories: COOKIE_CATEGORIES,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load cookie consent", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let session = null;
    try {
      session = await getSession();
    } catch {}

    const { decision, preferences, analytics, marketing, visitorId } = body;

    const secGpc =
      req.headers?.get("Sec-GPC") === "1" ||
      req.headers?.get("sec-gpc") === "1" ||
      req.headers?.get("DNT") === "1";

    let targetPrefs = false;
    let targetAnalytics = false;
    let targetDecision: "ACCEPT_ALL" | "REJECT_ALL" | "CUSTOM" = "CUSTOM";

    if (decision === "ACCEPT_ALL") {
      targetPrefs = true;
      targetAnalytics = secGpc ? false : true; // Honor Sec-GPC by suppressing analytics
      targetDecision = "ACCEPT_ALL";
    } else if (decision === "REJECT_ALL") {
      targetPrefs = false;
      targetAnalytics = false;
      targetDecision = "REJECT_ALL";
    } else {
      targetPrefs = Boolean(preferences);
      targetAnalytics = secGpc ? false : Boolean(analytics);
      targetDecision = "CUSTOM";
    }

    const consentState = await recordConsent({
      userId: session?.id,
      visitorId,
      preferences: targetPrefs,
      analytics: targetAnalytics,
      marketing: Boolean(marketing),
      decision: targetDecision,
    });

    const response = NextResponse.json({
      success: true,
      message: "Cookie preferences recorded successfully.",
      consent: consentState,
    });

    response.cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consentState), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error("[POST /api/consent Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save cookie consent", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(req?: Request) {
  try {
    let session = null;
    try {
      session = await getSession();
    } catch {}

    let visitorId: string | undefined;

    if (req) {
      try {
        const body = await req.json();
        visitorId = body?.visitorId;
      } catch {}
    }

    const consentState = await withdrawConsent(session?.id, visitorId);

    const response = NextResponse.json({
      success: true,
      message: "Cookie consent withdrawn. Non-essential cookies removed.",
      consent: consentState,
    });

    response.cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consentState), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });

    response.cookies.delete("_pk_id");
    response.cookies.delete("_pk_ses");
    response.cookies.delete("pulsesocial_theme");
    response.cookies.delete("pulsesocial_active_brand");

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to withdraw cookie consent", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
