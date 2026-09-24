import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SupportedPlatform } from "@/lib/social/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawKey = (await params).provider.toLowerCase();
    const platformKey = (
      rawKey === "google" || rawKey === "google-business"
        ? "google_business"
        : rawKey
    ) as SupportedPlatform;

    const account = await prisma.socialAccount.findFirst({
      where: {
        organizationId: session.activeOrgId,
        provider: platformKey,
      },
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

    if (!account) {
      return NextResponse.json({
        success: true,
        connected: false,
        connection: null,
      });
    }

    let scopesList: string[] = [];
    try {
      if (account.scopes) {
        scopesList = typeof account.scopes === "string" ? JSON.parse(account.scopes) : account.scopes;
      }
    } catch {
      scopesList = [];
    }

    return NextResponse.json({
      success: true,
      connected: true,
      connection: {
        id: account.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        displayName: account.displayName,
        accountName: account.displayName,
        username: account.username,
        avatarUrl: account.profileImageUrl,
        accountType: account.accountType || "Channel / Profile",
        status: account.status || "CONNECTED",
        scopes: scopesList,
        followersCount: account.profile?.followersCount ?? 0,
        followingCount: account.profile?.followingCount ?? 0,
        postsCount: account.profile?.postsCount ?? 0,
        lastSyncedAt: account.lastSyncedAt ? account.lastSyncedAt.toISOString() : null,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch connection" },
      { status: 500 }
    );
  }
}
