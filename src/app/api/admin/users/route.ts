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
    const role = searchParams.get("role")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.memberships = {
        some: {
          role: role,
        },
      };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          memberships: {
            select: {
              id: true,
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              postsCreated: true,
              aiGenerations: true,
              auditLogs: true,
            },
          },
        },
      }),
    ]);

    // Format users for frontend consumption
    const formattedUsers = users.map((u) => {
      // Primary role from top membership or default
      const topRole =
        u.memberships.find((m) => m.role === "OWNER")?.role ||
        u.memberships.find((m) => m.role === "ADMIN")?.role ||
        u.memberships[0]?.role ||
        "MEMBER";

      return {
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        avatarUrl: u.avatarUrl,
        status: u.status || "ACTIVE",
        role: topRole,
        emailVerified: u.emailVerified,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        organizations: u.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        })),
        counts: {
          posts: u._count.postsCreated,
          aiGenerations: u._count.aiGenerations,
          auditLogs: u._count.auditLogs,
        },
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_USERS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve users.", details: error.message },
      { status: 500 }
    );
  }
}
