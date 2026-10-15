import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const provider = searchParams.get("provider")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }
    if (provider) {
      where.provider = provider.toLowerCase();
    }
    if (status) {
      where.status = status;
    }

    const [total, accounts] = await Promise.all([
      prisma.socialAccount.count({ where }),
      prisma.socialAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { connectedAt: "desc" },
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          displayName: true,
          username: true,
          profileImageUrl: true,
          accountType: true,
          status: true,
          connectedAt: true,
          lastSyncedAt: true,
          tokenExpiresAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          token: {
            select: {
              id: true,
              expiresAt: true,
              keyVersion: true,
            },
          },
          _count: {
            select: {
              postTargets: true,
              comments: true,
              messages: true,
              syncJobs: true,
            },
          },
        },
      }),
    ]);

    const formatted = accounts.map((acc) => {
      const isTokenExpired = acc.tokenExpiresAt
        ? new Date(acc.tokenExpiresAt).getTime() < Date.now()
        : false;

      return {
        id: acc.id,
        provider: acc.provider,
        displayName: acc.displayName,
        username: acc.username,
        profileImageUrl: acc.profileImageUrl,
        accountType: acc.accountType || "PROFILE",
        status: isTokenExpired ? "EXPIRED" : acc.status,
        connectedAt: acc.connectedAt,
        lastSyncedAt: acc.lastSyncedAt,
        tokenExpiresAt: acc.tokenExpiresAt,
        isTokenExpired,
        hasToken: !!acc.token,
        organization: acc.organization,
        counts: {
          postsPublished: acc._count.postTargets,
          comments: acc._count.comments,
          messages: acc._count.messages,
          syncJobs: acc._count.syncJobs,
        },
      };
    });

    return NextResponse.json({
      accounts: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_SOCIAL_ACCOUNTS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve social accounts.", details: error.message },
      { status: 500 }
    );
  }
}
