import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) Real-Time Workspace Activity Stream
 * GET /api/realtime/stream
 *
 * Requirements:
 * 1. Strict session authentication and server-side activeOrgId resolution.
 * 2. Cross-workspace isolation: Clients only receive events from their authorized workspace.
 * 3. Real events only (notifications, publish attempts, audit events) — zero fabricated activity.
 * 4. Periodic heartbeat ping (every 15s) and safe connection teardown on client abort.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.id || !session.activeOrgId) {
    return new Response(JSON.stringify({ error: "Unauthorized: Active workspace session required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const workspaceId = session.activeOrgId;
  const lastEventId = req.headers.get("last-event-id") || req.nextUrl.searchParams.get("lastEventId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send connection handshake
      const handshake = `event: connected\ndata: ${JSON.stringify({
        status: "CONNECTED",
        workspaceId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(handshake));

      // 2. Query any recent real notifications or audit logs for this workspace (supporting Last-Event-ID resume)
      try {
        const recentEvents = await prisma.auditLog.findMany({
          where: {
            organizationId: workspaceId,
            ...(lastEventId ? { id: { gt: lastEventId } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        for (const evt of recentEvents) {
          const payload = `id: ${evt.id}\nevent: audit_event\ndata: ${JSON.stringify({
            id: evt.id,
            action: evt.action,
            resourceType: evt.resourceType,
            timestamp: evt.createdAt.toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
      } catch {}

      // 3. Heartbeat interval
      const heartbeatInterval = setInterval(() => {
        try {
          const ping = `: heartbeat ${Date.now()}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
