import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SupportedPlatform } from "@/lib/social/types";

export async function POST(
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
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: `No connected ${platformKey} account found to refresh` },
        { status: 404 }
      );
    }

    // Update lastSyncedAt timestamp
    const updated = await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        lastSyncedAt: new Date(),
        status: "CONNECTED",
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${updated.displayName} synced successfully.`,
      lastSyncedAt: updated.lastSyncedAt?.toISOString(),
      account: {
        id: updated.id,
        displayName: updated.displayName,
        username: updated.username,
        followersCount: updated.profile?.followersCount ?? 0,
        followingCount: updated.profile?.followingCount ?? 0,
        postsCount: updated.profile?.postsCount ?? 0,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to refresh account" },
      { status: 500 }
    );
  }
}
