import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

    const connections = accounts.map((acc) => {
      let scopesList: string[] = [];
      try {
        if (acc.scopes) {
          scopesList = typeof acc.scopes === "string" ? JSON.parse(acc.scopes) : acc.scopes;
        }
      } catch {
        scopesList = [];
      }

      let metadataObj: Record<string, any> = {};
      try {
        if (acc.metadata) {
          metadataObj = typeof acc.metadata === "string" ? JSON.parse(acc.metadata) : acc.metadata;
        }
      } catch {
        metadataObj = {};
      }

      return {
        id: acc.id,
        provider: acc.provider,
        providerAccountId: acc.providerAccountId,
        displayName: acc.displayName,
        accountName: acc.displayName,
        username: acc.username,
        avatarUrl: acc.profileImageUrl,
        profileImageUrl: acc.profileImageUrl,
        accountType: acc.accountType || "Channel / Profile",
        status: acc.status || "CONNECTED",
        scopes: scopesList,
        metadata: metadataObj,
        followersCount: acc.profile?.followersCount ?? 0,
        followingCount: acc.profile?.followingCount ?? 0,
        postsCount: acc.profile?.postsCount ?? 0,
        lastSyncedAt: acc.lastSyncedAt ? acc.lastSyncedAt.toISOString() : null,
        tokenExpiresAt: acc.token?.expiresAt ? acc.token.expiresAt.toISOString() : null,
        createdAt: acc.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      connections,
      total: connections.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch connections" },
      { status: 500 }
    );
  }
}
