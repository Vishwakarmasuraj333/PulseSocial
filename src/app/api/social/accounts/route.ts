import { NextResponse } from "next/server";
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

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct account creation is disabled. Please connect your social channels securely using the official OAuth flow via /api/social/[provider]/connect.",
    },
    { status: 400 }
  );
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

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

