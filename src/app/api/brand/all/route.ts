import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.id },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                socialAccounts: true,
                posts: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const brands = memberships.map((m) => {
      const org = m.organization as any;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        handle: `@${org.slug}`,
        avatarUrl: org.logoUrl || "",
        logoUrl: org.logoUrl,
        coverUrl: org.coverUrl || "",
        timezone: org.timezone || "Asia/Kolkata",
        description: org.description || "",
        role: m.role,
        connectedAccountsCount: org._count?.socialAccounts || 0,
        postsCount: org._count?.posts || 0,
        membersCount: org._count?.members || 0,
        createdAt: org.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      brands,
      activeBrandId: session.activeOrgId || (brands[0]?.id ?? null),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch user brands" },
      { status: 500 }
    );
  }
}
