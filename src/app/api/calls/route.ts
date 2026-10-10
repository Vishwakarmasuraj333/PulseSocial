import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCallProvider } from "@/lib/calls/call-provider";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = getCallProvider();
    const isConfigured = provider.isConfigured();

    return NextResponse.json({
      success: true,
      provider: provider.name,
      configured: isConfigured,
      status: isConfigured ? "configured" : "not_configured",
      message: isConfigured ? "Calls service ready." : "Calls not configured",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const roomName = body.roomName || `room-${session.activeOrgId}`;
    const participantIdentity = session.id;
    const participantName = session.name || session.email;

    const provider = getCallProvider();
    const sessionResult = await provider.createSession({
      roomName,
      participantIdentity,
      participantName,
    });

    if (!sessionResult.configured) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          status: "not_configured",
          error: "Calls not configured",
          message: sessionResult.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      configured: true,
      session: sessionResult,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
