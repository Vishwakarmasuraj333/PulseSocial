import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";
import {
  exchangeGoogleAuthCode,
  fetchGoogleUserInfo,
  getGoogleRedirectUri,
  verifySignedOAuthState,
  parseGoogleIdToken,
} from "@/lib/auth/google-oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  const savedVerifier = cookieStore.get("google_oauth_code_verifier")?.value;
  const savedRedirectUri = cookieStore.get("google_oauth_redirect_uri")?.value;

  // Clean up single-use OAuth cookies
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_oauth_code_verifier");
  cookieStore.delete("google_oauth_nonce");
  cookieStore.delete("google_oauth_redirect_uri");

  // 1. Handle user cancellation or provider rejection from Google
  if (error) {
    const loginUrl = new URL("/login", req.url);
    if (error === "access_denied") {
      loginUrl.searchParams.set("error", "access_denied");
      loginUrl.searchParams.set("message", "Google sign-in was cancelled.");
    } else {
      loginUrl.searchParams.set("error", error);
      loginUrl.searchParams.set(
        "message",
        errorDescription || `Google authentication failed (${error}).`
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Validate code and state
  if (!code || !state) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "missing_code");
    loginUrl.searchParams.set(
      "message",
      "Google authentication did not provide an authorization code. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Cryptographically verify signed state token (works even if cross-domain cookies are dropped by browser)
  const verifiedState = verifySignedOAuthState(state);
  const isCookieStateValid = Boolean(savedState && savedState === state);

  if (!verifiedState && !isCookieStateValid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "invalid_state");
    loginUrl.searchParams.set(
      "message",
      "Google authentication failed. Invalid or expired session state. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  const effectiveVerifier = verifiedState?.verifier || savedVerifier;
  const effectiveRedirectUri = verifiedState?.redirectUri || savedRedirectUri || getGoogleRedirectUri(req);

  if (!effectiveVerifier) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "pkce_verifier_missing");
    loginUrl.searchParams.set(
      "message",
      "Authentication PKCE code verifier was not found. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim().replace(/^["']|["']$/g, "");
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim().replace(/^["']|["']$/g, "");

    if (!clientId || !clientSecret) {
      throw new Error(
        "Google authentication is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server environment."
      );
    }

    const redirectUri = effectiveRedirectUri;

    // 3. Exchange authorization code for tokens using PKCE verifier
    const tokenData = await exchangeGoogleAuthCode({
      code,
      clientId,
      clientSecret,
      redirectUri,
      codeVerifier: effectiveVerifier,
    });

    if (!tokenData.access_token) {
      throw new Error("No access token returned by Google OAuth server.");
    }

    // 4. Retrieve real user information from Google OpenID Connect and ID Token
    const googleProfile = await fetchGoogleUserInfo(tokenData.access_token);
    const idTokenClaims = parseGoogleIdToken(tokenData.id_token);

    const googleSub = googleProfile.sub || idTokenClaims?.sub;
    const cleanEmail = (googleProfile.email || idTokenClaims?.email || "").toLowerCase().trim();

    if (!googleSub || !cleanEmail) {
      throw new Error("Google response did not contain required subject ID or email address.");
    }

    const displayName = googleProfile.name || idTokenClaims?.name || cleanEmail.split("@")[0];
    const isEmailVerified = Boolean(
      googleProfile.email_verified ?? idTokenClaims?.email_verified ?? true
    );

    // 5. Look up user by Google Subject ID or verified email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleSubjectId: googleSub },
          { email: cleanEmail },
        ],
      },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    const now = new Date();

    if (user) {
      // Update existing user with latest verified Google identity
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubjectId: googleSub,
          emailVerified: isEmailVerified,
          emailVerifiedAt: user.emailVerifiedAt || now,
          name: user.name || displayName,
          firstName: googleProfile.given_name || undefined,
          lastName: googleProfile.family_name || undefined,
          avatarUrl: googleProfile.picture || user.avatarUrl,
          locale: googleProfile.locale || undefined,
          lastLoginAt: now,
          status: "ACTIVE",
        },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });

      // If user had no organization, provision one now
      if (user.memberships.length === 0) {
        const orgSlug = `${cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "-")}-brand-${Date.now().toString().slice(-4)}`;
        const org = await prisma.organization.create({
          data: {
            name: `${displayName}'s Workspace`,
            slug: orgSlug,
            timezone: "UTC",
          },
        });

        await prisma.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: "OWNER",
            channelsAccess: "ALL",
            isApprover: true,
          },
        });

        await prisma.settings.create({
          data: {
            organizationId: org.id,
            defaultTimezone: "UTC",
            requireApproval: false,
            aiAutoSuggest: true,
            notificationsEmail: true,
          },
        });

        user = await prisma.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            memberships: {
              include: { organization: true },
            },
          },
        });
      }
    } else {
      // Create new user record
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          googleSubjectId: googleSub,
          name: displayName,
          firstName: googleProfile.given_name || null,
          lastName: googleProfile.family_name || null,
          avatarUrl: googleProfile.picture || null,
          locale: googleProfile.locale || null,
          emailVerified: Boolean(googleProfile.email_verified ?? true),
          emailVerifiedAt: now,
          status: "ACTIVE",
          lastLoginAt: now,
        },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });

      // Create primary workspace organization for the new user
      const orgSlug = `${cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "-")}-brand-${Date.now().toString().slice(-4)}`;
      const org = await prisma.organization.create({
        data: {
          name: `${displayName}'s Workspace`,
          slug: orgSlug,
          timezone: "UTC",
        },
      });

      await prisma.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: "OWNER",
          channelsAccess: "ALL",
          isApprover: true,
        },
      });

      await prisma.settings.create({
        data: {
          organizationId: org.id,
          defaultTimezone: "UTC",
          requireApproval: false,
          aiAutoSuggest: true,
          notificationsEmail: true,
        },
      });

      // Reload with new membership
      user = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });
    }

    const activeOrgId = user.memberships[0]?.organizationId;
    const role = user.memberships[0]?.role || "OWNER";

    // 6. Establish secure application session with HttpOnly cookie
    const sessionToken = await createSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        activeOrgId,
        role,
      },
      true
    );

    // 7. Record security audit log
    await logAudit({
      organizationId: activeOrgId,
      userId: user.id,
      action: "GOOGLE_OAUTH_LOGIN",
      resourceType: "User",
      resourceId: user.id,
      details: {
        email: user.email,
        googleSub,
        verified: googleProfile.email_verified,
      },
    });

    // 8. Redirect to the authenticated dashboard and explicitly affix the session cookie
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", req.url));
    const isProd = process.env.NODE_ENV === "production";
    redirectResponse.cookies.set("pulsesocial_auth_session", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clean up oauth cookies on redirect response as well
    redirectResponse.cookies.delete("google_oauth_state");
    redirectResponse.cookies.delete("google_oauth_code_verifier");
    redirectResponse.cookies.delete("google_oauth_nonce");

    return redirectResponse;
  } catch (err: unknown) {
    console.error("Google OAuth token exchange error:", err);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "oauth_exchange_failed");
    loginUrl.searchParams.set(
      "message",
      (err as Error).message || "Google authentication failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }
}
