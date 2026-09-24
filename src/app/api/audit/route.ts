import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const whereClause: any = {};
    if (session.activeOrgId) {
      whereClause.OR = [
        { organizationId: session.activeOrgId },
        { userId: session.id },
      ];
    } else {
      whereClause.userId = session.id;
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formatted = logs.map((log) => {
      let parsedDetails: Record<string, any> = {};
      try {
        if (log.details) {
          parsedDetails = JSON.parse(log.details);
        }
      } catch {}

      // Map action to category type
      let type: "PUBLISHING" | "ACCOUNT" | "TEAM" | "SECURITY" = "SECURITY";
      if (log.action.includes("POST") || log.action.includes("PUBLISH")) {
        type = "PUBLISHING";
      } else if (log.action.includes("OAUTH") || log.action.includes("SOCIAL") || log.action.includes("ACCOUNT")) {
        type = "ACCOUNT";
      } else if (log.action.includes("MEMBER") || log.action.includes("TEAM") || log.action.includes("INVITE")) {
        type = "TEAM";
      }

      const userName = log.user?.name || log.user?.email || "System";
      const userInitials = (log.user?.name || log.user?.email || "S")
        .slice(0, 2)
        .toUpperCase();

      return {
        id: log.id,
        type,
        action: log.action,
        title: log.action.replace(/_/g, " "),
        description:
          parsedDetails.description ||
          parsedDetails.message ||
          `${log.resourceType} ${log.resourceId || ""}`.trim() ||
          `Action performed on ${log.resourceType}`,
        timestamp: new Date(log.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullDate: log.createdAt,
        user: {
          name: userName,
          avatarInitials: userInitials,
          avatarUrl: log.user?.avatarUrl,
        },
        platform: parsedDetails.platform || parsedDetails.provider || undefined,
        status: log.action.includes("FAILED") || log.action.includes("ERROR")
          ? ("WARNING" as const)
          : ("SUCCESS" as const),
      };
    });

    return NextResponse.json({ success: true, logs: formatted });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
