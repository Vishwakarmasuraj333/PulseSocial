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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          members: {
            where: { role: "OWNER" },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          settings: true,
          _count: {
            select: {
              members: true,
              socialAccounts: true,
              posts: true,
              campaigns: true,
            },
          },
        },
      }),
    ]);

    const formatted = organizations.map((org) => {
      const owner = org.members[0]?.user;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        timezone: org.timezone,
        createdAt: org.createdAt,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name || owner.email.split("@")[0],
              email: owner.email,
              avatarUrl: owner.avatarUrl,
            }
          : null,
        counts: {
          members: org._count.members,
          socialAccounts: org._count.socialAccounts,
          posts: org._count.posts,
          campaigns: org._count.campaigns,
        },
        settings: org.settings
          ? {
              brandColor: org.settings.brandColor,
              requireApproval: org.settings.requireApproval,
              defaultTimezone: org.settings.defaultTimezone,
            }
          : null,
      };
    });

    return NextResponse.json({
      organizations: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_ORGS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve organizations.", details: error.message },
      { status: 500 }
    );
  }
}
