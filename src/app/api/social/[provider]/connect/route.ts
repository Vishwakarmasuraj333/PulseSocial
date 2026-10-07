import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/security/encryption";

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

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || url.origin);
    const redirectUri = `${appUrl}/api/social/${platformKey}/callback`;

    // Resolve tenant organization
    let orgId = session.activeOrgId;
    if (!orgId) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: { memberships: true },
      });
      orgId = user?.memberships[0]?.organizationId;
    }

    // Direct WhatsApp Cloud API verification & connection
    if (
      platformKey === "whatsapp" &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      orgId
    ) {
      const accounts = await socialProvider.getAccounts(process.env.WHATSAPP_ACCESS_TOKEN);
      if (accounts && accounts.length > 0) {
        const primary = accounts[0];
        const encAccess = encryptToken(process.env.WHATSAPP_ACCESS_TOKEN);

        const account = await prisma.socialAccount.upsert({
          where: {
            organizationId_provider_providerAccountId: {
              organizationId: orgId,
              provider: "whatsapp",
              providerAccountId: primary.providerAccountId,
            },
          },
          update: {
            displayName: primary.displayName,
            username: primary.username,
            accountType: "WHATSAPP_BUSINESS",
            status: "CONNECTED",
            scopes: JSON.stringify(["whatsapp_business_messaging", "whatsapp_business_management"]),
            tokenExpiresAt: null,
          },
          create: {
            organizationId: orgId,
            provider: "whatsapp",
            providerAccountId: primary.providerAccountId,
            displayName: primary.displayName,
            username: primary.username,
            profileImageUrl: primary.profileImageUrl,
            accountType: "WHATSAPP_BUSINESS",
            status: "CONNECTED",
            scopes: JSON.stringify(["whatsapp_business_messaging", "whatsapp_business_management"]),
            tokenExpiresAt: null,
          },
        });

        await prisma.socialToken.upsert({
          where: { socialAccountId: account.id },
          update: {
            encryptedAccessToken: encAccess.encrypted,
            iv: encAccess.iv,
            tag: encAccess.tag,
          },
          create: {
            socialAccountId: account.id,
            encryptedAccessToken: encAccess.encrypted,
            iv: encAccess.iv,
            tag: encAccess.tag,
          },
        });

        if (wantsJson) {
          return NextResponse.json({
            success: true,
            connected: true,
            platform: "whatsapp",
            account: primary,
          });
        }
        return NextResponse.redirect(new URL("/social-accounts?connected=whatsapp", req.url));
      }
    }

    // If provider credentials are not configured in environment, return clear unconfigured status
    if (!socialProvider.isConfigured()) {
      const missingMsg = socialProvider.getMissingConfigMessage();
      if (wantsJson) {
        return NextResponse.json(
          {
            success: false,
            isConfigured: false,
            platform: platformKey,
            displayName: socialProvider.displayName,
            error: missingMsg,
            redirectUri,
          },
          { status: 400 }
        );
      }

      return NextResponse.redirect(
        new URL(
          `/settings?tab=channels&error=${encodeURIComponent(missingMsg)}`,
          req.url
        )
      );
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

    cookieStore.set(`oauth_redirect_uri_${platformKey}`, redirectUri, {
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
