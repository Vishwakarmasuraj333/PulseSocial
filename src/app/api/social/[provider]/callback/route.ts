import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { encryptToken } from "@/lib/security/encryption";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { provider } = await params;
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");
    const errorDesc = url.searchParams.get("error_description");

    if (errorParam) {
      return NextResponse.redirect(
        new URL(
          `/onboarding/socials?error=${encodeURIComponent(errorDesc || errorParam)}`,
          req.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/onboarding/socials?error=Missing+authorization+code", req.url)
      );
    }

    const platformKey = provider.toLowerCase() as SupportedPlatform;
    const socialProvider = getSocialProvider(platformKey);

    // Retrieve active organization
    let orgId = session.activeOrgId;
    if (!orgId) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: { memberships: true },
      });
      orgId = user?.memberships[0]?.organizationId;
    }

    if (!orgId) {
      return NextResponse.redirect(
        new URL("/onboarding/socials?error=No+active+workspace+found", req.url)
      );
    }

    // REAL OAUTH FLOW:
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${platformKey}`)?.value;
    const storedVerifier = cookieStore.get(`oauth_verifier_${platformKey}`)?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL(
          "/onboarding/socials?error=State+mismatch.+OAuth+request+may+have+been+forged.",
          req.url
        )
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const redirectUri = `${appUrl}/api/social/${platformKey}/callback`;

    // 1. Exchange code for access & refresh tokens
    const tokenResult = await socialProvider.exchangeCode(code, redirectUri, storedVerifier);

    // 2. Encrypt tokens at rest using hardware-grade AES-256-GCM
    const encAccess = encryptToken(tokenResult.accessToken);
    const encRefresh = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;

    // 3. Fetch remote accounts info
    const accounts = await socialProvider.getAccounts(tokenResult.accessToken);
    if (!accounts || accounts.length === 0) {
      throw new Error(`No accessible ${socialProvider.displayName} accounts or pages were found.`);
    }

    const primaryAccount = accounts[0];

    // 4. Save SocialAccount record
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        organizationId_provider_providerAccountId: {
          organizationId: orgId,
          provider: platformKey,
          providerAccountId: primaryAccount.providerAccountId,
        },
      },
      update: {
        displayName: primaryAccount.displayName,
        username: primaryAccount.username,
        profileImageUrl: primaryAccount.profileImageUrl,
        accountType: primaryAccount.accountType,
        status: "CONNECTED",
        scopes: JSON.stringify(tokenResult.scopes),
        metadata: JSON.stringify(primaryAccount.metadata || {}),
        lastSyncedAt: new Date(),
        tokenExpiresAt: tokenResult.expiresIn
          ? new Date(Date.now() + tokenResult.expiresIn * 1000)
          : null,
      },
      create: {
        organizationId: orgId,
        provider: platformKey,
        providerAccountId: primaryAccount.providerAccountId,
        displayName: primaryAccount.displayName,
        username: primaryAccount.username,
        profileImageUrl: primaryAccount.profileImageUrl,
        accountType: primaryAccount.accountType,
        status: "CONNECTED",
        scopes: JSON.stringify(tokenResult.scopes),
        metadata: JSON.stringify(primaryAccount.metadata || {}),
        lastSyncedAt: new Date(),
        tokenExpiresAt: tokenResult.expiresIn
          ? new Date(Date.now() + tokenResult.expiresIn * 1000)
          : null,
      },
    });

    // 5. Save encrypted tokens
    await prisma.socialToken.upsert({
      where: { socialAccountId: socialAccount.id },
      update: {
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh?.encrypted,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenResult.expiresIn
          ? new Date(Date.now() + tokenResult.expiresIn * 1000)
          : null,
      },
      create: {
        socialAccountId: socialAccount.id,
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh?.encrypted,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenResult.expiresIn
          ? new Date(Date.now() + tokenResult.expiresIn * 1000)
          : null,
      },
    });

    // 6. Sync profile
    try {
      const profile = await socialProvider.getProfile(
        tokenResult.accessToken,
        primaryAccount.providerAccountId
      );
      await prisma.socialProfile.upsert({
        where: { socialAccountId: socialAccount.id },
        update: {
          bio: profile.bio,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount,
          postsCount: profile.postsCount,
          websiteUrl: profile.websiteUrl,
        },
        create: {
          socialAccountId: socialAccount.id,
          bio: profile.bio,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount,
          postsCount: profile.postsCount,
          websiteUrl: profile.websiteUrl,
        },
      });
    } catch (e) {
      console.warn("Could not sync profile metrics immediately:", e);
    }

    await logAudit({
      organizationId: orgId,
      userId: session.id,
      action: "OAUTH_CONNECTED",
      resourceType: "SocialAccount",
      resourceId: socialAccount.id,
      details: {
        provider: platformKey,
        providerAccountId: primaryAccount.providerAccountId,
        accountType: primaryAccount.accountType,
      },
    });

    const redirectTarget = `/dashboard?connected=${platformKey}&accountName=${encodeURIComponent(
      primaryAccount.displayName
    )}&username=${encodeURIComponent(primaryAccount.username || "")}&avatar=${encodeURIComponent(
      primaryAccount.profileImageUrl || ""
    )}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>PulseSocial - Channel Connected</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0B0F19; color: #fff; }
    .box { text-align: center; padding: 32px; background: #111827; border-radius: 16px; border: 1px solid #1f2937; max-width: 420px; }
    h2 { margin: 0 0 8px; font-size: 20px; color: #10b981; }
    p { margin: 0; font-size: 14px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="box">
    <h2>✓ Channel Connected!</h2>
    <p>Linking ${primaryAccount.displayName} with PulseSocial...</p>
  </div>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: "PULSESOCIAL_CHANNEL_CONNECTED",
          account: {
            id: "${socialAccount.id}",
            platform: "${platformKey}",
            displayName: ${JSON.stringify(primaryAccount.displayName)},
            username: ${JSON.stringify(primaryAccount.username || "")},
            avatarUrl: ${JSON.stringify(primaryAccount.profileImageUrl || "")},
            providerAccountId: ${JSON.stringify(primaryAccount.providerAccountId)},
            scopes: ${JSON.stringify(tokenResult.scopes || [])},
            metadata: ${JSON.stringify(primaryAccount.metadata || {})}
          }
        }, "*");
        setTimeout(function() { window.close(); }, 800);
      } else {
        window.location.href = "${redirectTarget}";
      }
    } catch (e) {
      window.location.href = "${redirectTarget}";
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/onboarding/socials?error=${encodeURIComponent((error as Error).message || "OAuth failed")}`,
        req.url
      )
    );
  }
}
