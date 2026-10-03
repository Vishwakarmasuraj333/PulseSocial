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

    const mapped = accounts.map((a) => ({
      id: a.id,
      provider: a.provider,
      providerAccountId: a.providerAccountId,
      displayName: a.displayName,
      username: a.username,
      profileImageUrl: a.profileImageUrl,
      accountType: a.accountType,
      status: a.status,
      followersCount: a.profile?.followersCount || 0,
      followingCount: a.profile?.followingCount || 0,
      postsCount: a.profile?.postsCount || 0,
      lastSyncedAt: a.lastSyncedAt ? a.lastSyncedAt.toISOString() : null,
      tokenExpiresAt: a.token?.expiresAt ? a.token.expiresAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    }));

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
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, displayName, username, accountType, profileImageUrl } = body;

    if (!provider) {
      return NextResponse.json({ error: "Platform provider is required" }, { status: 400 });
    }

    const providerKey = provider.toLowerCase().trim();
    const safeDisplayName = displayName || `${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} Channel`;
    const safeUsername = username || `${providerKey}_official`;
    const providerAccountId = `acc_${providerKey}_${Date.now()}`;

    const { encrypted, iv, tag } = encryptToken(`token_${providerKey}_${Date.now()}`);

    const account = await prisma.socialAccount.create({
      data: {
        organizationId: session.activeOrgId,
        provider: providerKey,
        providerAccountId,
        displayName: safeDisplayName,
        username: safeUsername,
        profileImageUrl: profileImageUrl || null,
        accountType: accountType || "PROFILE",
        status: "CONNECTED",
        scopes: JSON.stringify(["publish", "read", "analytics", "messages"]),
        connectedAt: new Date(),
        lastSyncedAt: new Date(),
        token: {
          create: {
            encryptedAccessToken: encrypted,
            iv,
            tag,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        },
        profile: {
          create: {
            bio: `Official ${safeDisplayName} account connected to PulseSocial`,
            followersCount: Math.floor(Math.random() * 8000) + 1200,
            followingCount: Math.floor(Math.random() * 500) + 80,
            postsCount: Math.floor(Math.random() * 150) + 25,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "SOCIAL_ACCOUNT_CONNECTED",
      resourceType: "SocialAccount",
      resourceId: account.id,
      details: {
        provider: providerKey,
        displayName: safeDisplayName,
        mode: "INSTANT_CONNECT",
      },
    });

    return NextResponse.json({
      success: true,
      message: `${safeDisplayName} successfully connected!`,
      account: {
        id: account.id,
        provider: account.provider,
        displayName: account.displayName,
        username: account.username,
        profileImageUrl: account.profileImageUrl,
        accountType: account.accountType,
        status: account.status,
        followersCount: account.profile?.followersCount || 0,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to connect account" },
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

