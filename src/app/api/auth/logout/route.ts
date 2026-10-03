import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

export async function POST() {
  const session = await getSession();
  if (session?.id) {
    try {
      await logAudit({
        userId: session.id,
        action: "USER_LOGOUT",
        resourceType: "User",
        resourceId: session.id,
      });
    } catch {}
  }

  await destroySession();
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  res.cookies.set("pulsesocial_auth_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  res.cookies.delete("pulsesocial_auth_session");
  res.cookies.delete("pulsesocial_session");
  return res;
}

export async function GET(req: Request) {
  await destroySession();
  const res = NextResponse.redirect(new URL("/login?logout=true", req.url));
  res.cookies.set("pulsesocial_auth_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  res.cookies.delete("pulsesocial_auth_session");
  res.cookies.delete("pulsesocial_session");
  return res;
}

