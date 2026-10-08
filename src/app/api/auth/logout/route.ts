import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

function applyExhaustiveCookiePurge(res: NextResponse) {
  const cookieNames = ["pulsesocial_auth_session", "pulsesocial_session", "next-auth.session-token"];
  
  for (const name of cookieNames) {
    try {
      res.cookies.delete(name);
    } catch {}

    // 1. Purge with Secure=true
    res.cookies.set(name, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    // 2. Purge without Secure (for localhost / non-https testing)
    res.cookies.set(name, "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    // 3. Fallback explicit Raw Set-Cookie header
    res.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`
    );
  }
}

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
  applyExhaustiveCookiePurge(res);
  return res;
}

export async function GET(req: Request) {
  await destroySession();
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirectTo") || "/?logout=true";
  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  applyExhaustiveCookiePurge(res);
  return res;
}


