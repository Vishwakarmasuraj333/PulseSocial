import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

export async function POST() {
  const session = await getSession();
  if (session?.id) {
    await logAudit({
      userId: session.id,
      action: "USER_LOGOUT",
      resourceType: "User",
      resourceId: session.id,
    });
  }

  await destroySession();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url));
}
