import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: session.activeOrgId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.user ? (log.user.name || log.user.email) : "System Operations",
      target: log.resourceType + (log.resourceId ? ` (#${log.resourceId.slice(-6)})` : ""),
      ip: log.ipAddress || "127.0.0.1",
      time: new Date(log.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "SUCCESS",
    }));

    return NextResponse.json({
      success: true,
      logs: formatted,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
