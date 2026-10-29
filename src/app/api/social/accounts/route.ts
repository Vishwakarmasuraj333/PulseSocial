import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/security/encryption";
import { logAudit } from "@/lib/audit/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { organizationId: session.activeOrgId },
      include: {
        profile: true,
        token: {
          select: {
            expiresAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = accounts.map((a) => {
      let meta: Record<string, unknown> = {};
      try {
        meta = a.metadata ? JSON.parse(a.metadata) : {};
      } catch {}

      // Calculate real remaining validity in days
      let validityDays = 60; // Default standard validity
      if (a.token?.expiresAt) {
        const diff = Math.ceil(
          (new Date(a.token.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        validityDays = Math.max(0, diff);
      } else if (a.tokenExpiresAt) {
        const diff = Math.ceil(
          (new Date(a.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        validityDays = Math.max(0, diff);
      } else if (
        a.provider === "telegram" ||
        a.provider === "mastodon" ||
        a.provider === "bluesky"
      ) {
        validityDays = 365; // Permanent bot/app credentials
      }

      return {
        id: a.id,
        provider: a.provider,
        providerAccountId: a.providerAccountId,
        displayName: a.displayName,
        username: a.username,
        profileImageUrl: a.profileImageUrl,
        accountType: a.accountType || "Page",
        status: a.status,
        syncPosts: meta.syncPosts !== false,
        validityDays,
        followersCount: a.profile?.followersCount !== undefined ? a.profile.followersCount : null,
        followingCount: a.profile?.followingCount !== undefined ? a.profile.followingCount : null,
        postsCount: a.profile?.postsCount !== undefined ? a.profile.postsCount : null,
        lastSyncedAt: a.lastSyncedAt ? a.lastSyncedAt.toISOString() : null,
        tokenExpiresAt: a.token?.expiresAt ? a.token.expiresAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, accounts: mapped });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized: Active session required." }, { status: 401 });
    }

    let orgId = session.activeOrgId;
    if (!orgId) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: { memberships: true },
      });
      orgId = user?.memberships[0]?.organizationId;
    }

    if (!orgId) {
      return NextResponse.json({ error: "No active workspace organization found." }, { status: 400 });
    }

    const body = await req.json();
    const rawProvider = (body.provider || "").toLowerCase();
    const normalizedProvider = rawProvider === "twitter" ? "x" : rawProvider;

    if (!normalizedProvider) {
      return NextResponse.json({ error: "Social provider identifier is required." }, { status: 400 });
    }

    // STRICT PROHIBITION: Never allow an Instagram connection via typed username alone.
    // Instagram accounts must authenticate via official Instagram Login for Business.
    if (normalizedProvider === "instagram") {
      return NextResponse.json(
        {
          error:
            "Instagram accounts cannot be connected via username alone. You must authenticate through official Instagram Login for Professional accounts.",
        },
        { status: 400 }
      );
    }

    const cleanUsername = body.username ? String(body.username).replace(/^@/, "").trim() : null;
    const providerAccountId =
      body.providerAccountId ||
      `${normalizedProvider}_${(cleanUsername || session.id).replace(/[^a-zA-Z0-9_-]/g, "")}_${Date.now().toString(36)}`;

    const displayName =
      body.displayName ||
      (cleanUsername ? `@${cleanUsername} (${normalizedProvider.toUpperCase()})` : `${normalizedProvider.toUpperCase()} Account`);

    const tokenToSave =
      body.accessToken?.trim() ||
      `token_${normalizedProvider}_${Date.now()}_${crypto.randomBytes(16).toString("hex")}`;
    const encAccess = encryptToken(tokenToSave);

    const tokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days validity

    const account = await prisma.socialAccount.upsert({
      where: {
        organizationId_provider_providerAccountId: {
          organizationId: orgId,
          provider: normalizedProvider,
          providerAccountId,
        },
      },
      update: {
        displayName,
        username: cleanUsername,
        profileImageUrl: body.profileImageUrl || null,
        accountType: body.accountType || "PAGE",
        status: "CONNECTED",
        scopes: JSON.stringify(body.scopes || ["basic_read", "content_publish", "analytics_read"]),
        metadata: JSON.stringify(body.metadata || {}),
        lastSyncedAt: new Date(),
        tokenExpiresAt,
      },
      create: {
        organizationId: orgId,
        provider: normalizedProvider,
        providerAccountId,
        displayName,
        username: cleanUsername,
        profileImageUrl: body.profileImageUrl || null,
        accountType: body.accountType || "PAGE",
        status: "CONNECTED",
        scopes: JSON.stringify(body.scopes || ["basic_read", "content_publish", "analytics_read"]),
        metadata: JSON.stringify(body.metadata || {}),
        lastSyncedAt: new Date(),
        tokenExpiresAt,
      },
    });

    await prisma.socialToken.upsert({
      where: { socialAccountId: account.id },
      update: {
        encryptedAccessToken: encAccess.encrypted,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenExpiresAt,
      },
      create: {
        socialAccountId: account.id,
        encryptedAccessToken: encAccess.encrypted,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenExpiresAt,
      },
    });

    try {
      await logAudit({
        organizationId: orgId,
        userId: session.id,
        action: "SOCIAL_ACCOUNT_CONNECTED",
        resourceType: "SocialAccount",
        resourceId: account.id,
        details: { provider: normalizedProvider, providerAccountId, displayName },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        provider: account.provider,
        platform: account.provider,
        displayName: account.displayName,
        username: account.username,
        profileImageUrl: account.profileImageUrl,
        accountType: account.accountType,
        status: account.status,
      },
    });
  } catch (err: unknown) {
    console.error("Account connect error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to connect social account." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("id");
    const provider = searchParams.get("provider");

    if (!accountId && !provider) {
      return NextResponse.json({ error: "Account ID or provider is required" }, { status: 400 });
    }

    if (accountId) {
      const account = await prisma.socialAccount.findFirst({
        where: {
          id: accountId,
          organizationId: session.activeOrgId,
        },
      });

      if (!account) {
        return NextResponse.json({ error: "Social account not found" }, { status: 404 });
      }

      await prisma.socialAccount.delete({
        where: { id: account.id },
      });

      await logAudit({
        organizationId: session.activeOrgId,
        userId: session.id,
        action: "SOCIAL_ACCOUNT_DISCONNECTED",
        resourceType: "SocialAccount",
        resourceId: account.id,
        details: { provider: account.provider, displayName: account.displayName },
      });

      return NextResponse.json({
        success: true,
        message: `${account.displayName} has been disconnected.`,
      });
    }

    if (provider) {
      const deleted = await prisma.socialAccount.deleteMany({
        where: {
          organizationId: session.activeOrgId,
          provider: provider.toLowerCase(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Accounts for ${provider} have been disconnected.`,
        count: deleted.count,
      });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to disconnect account" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, syncPosts } = body;

    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const account = await prisma.socialAccount.findFirst({
      where: { id, organizationId: session.activeOrgId },
    });

    if (!account) {
      return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = account.metadata ? JSON.parse(account.metadata) : {};
    } catch {}

    if (typeof syncPosts === "boolean") {
      meta.syncPosts = syncPosts;
    }

    const updated = await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        ...(status ? { status } : {}),
        metadata: JSON.stringify(meta),
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update account" },
      { status: 500 }
    );
  }
}
