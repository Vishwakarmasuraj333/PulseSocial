import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

export async function POST(req: Request) {
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
  const isSecure = process.env.NODE_ENV === "production" || req.url.startsWith("https:");
  
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  res.cookies.set("pulsesocial_auth_session", "", cookieOptions);
  res.cookies.set("pulsesocial_session", "", cookieOptions);
  return res;
}

export async function GET(req: Request) {
  await destroySession();
  const res = NextResponse.redirect(new URL("/login?logout=true", req.url));
  const isSecure = process.env.NODE_ENV === "production" || req.url.startsWith("https:");

  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  res.cookies.set("pulsesocial_auth_session", "", cookieOptions);
  res.cookies.set("pulsesocial_session", "", cookieOptions);
  return res;
}

