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
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }

    const [total, posts] = await Promise.all([
      prisma.socialPost.count({ where }),
      prisma.socialPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          targets: {
            include: {
              socialAccount: {
                select: {
                  provider: true,
                  displayName: true,
                  username: true,
                },
              },
            },
          },
          media: {
            select: {
              id: true,
              url: true,
              mediaType: true,
            },
          },
          attempts: {
            take: 3,
            orderBy: { attemptedAt: "desc" },
            select: {
              id: true,
              provider: true,
              status: true,
              errorMessage: true,
              attemptedAt: true,
            },
          },
        },
      }),
    ]);

    const formatted = posts.map((p) => ({
      id: p.id,
      content: p.content,
      status: p.status,
      scheduledFor: p.scheduledFor,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      creator: {
        id: p.creator.id,
        name: p.creator.name || p.creator.email.split("@")[0],
        email: p.creator.email,
        avatarUrl: p.creator.avatarUrl,
      },
      organization: p.organization,
      media: p.media,
      targets: p.targets.map((t) => ({
        id: t.id,
        provider: t.socialAccount.provider,
        accountName: t.socialAccount.displayName,
        status: t.status,
        errorMessage: t.errorMessage,
        publishedAt: t.publishedAt,
      })),
      recentAttempts: p.attempts,
    }));

    return NextResponse.json({
      posts: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_POSTS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts.", details: error.message },
      { status: 500 }
    );
  }
}
