import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(req.url)}`, req.url));
    }

    const url = new URL(req.url);
    const rawKey = (await params).provider.toLowerCase();
    const platformKey = (
      rawKey === "google" || rawKey === "google-business"
        ? "google_business"
        : rawKey
    ) as SupportedPlatform;
    const socialProvider = getSocialProvider(platformKey);

    const wantsJson =
      url.searchParams.get("format") === "json" ||
      req.headers.get("accept")?.includes("application/json");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const redirectUri = `${appUrl}/api/social/${platformKey}/callback`;

    // If real provider credentials are not configured in environment
    if (!socialProvider.isConfigured()) {
      if (wantsJson) {
        return NextResponse.json({
          success: false,
          isConfigured: false,
          platform: platformKey,
          displayName: socialProvider.displayName,
          missingConfigMessage: socialProvider.getMissingConfigMessage(),
          redirectUri,
        });
      }

      const redirectUrl = new URL("/connections", req.url);
      redirectUrl.searchParams.set("blocked", "true");
      redirectUrl.searchParams.set("provider", platformKey);
      redirectUrl.searchParams.set(
        "message",
        `Configuration Required: ${socialProvider.getMissingConfigMessage()}`
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Generate secure cryptographic state & PKCE codeVerifier
    const state = crypto.randomBytes(32).toString("hex");
    const codeVerifier = crypto.randomBytes(32).toString("base64url");

    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${platformKey}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });

    cookieStore.set(`oauth_verifier_${platformKey}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    // Direct redirection to official third-party authorization consent screen
    const authUrl = socialProvider.getAuthorizationUrl(state, redirectUri, codeVerifier);

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        isConfigured: true,
        platform: platformKey,
        displayName: socialProvider.displayName,
        authUrl,
        redirectUri,
      });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    console.error("Social connect error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to initiate social authorization" },
      { status: 500 }
    );
  }
}
