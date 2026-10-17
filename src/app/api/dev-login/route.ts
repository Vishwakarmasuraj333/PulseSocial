import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(req: Request) {
  // PulseSocial dev auto-login route
  if (process.env.NODE_ENV === "production" && !process.env.DEV_BYPASS) {
    return NextResponse.json({ error: "Dev login is disabled in production" }, { status: 403 });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get("target") || "/posts";

  const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
  );

  const token = await new SignJWT({
    sub: "cmuv9f1f10000lf04desfmwvu",
    email: "itxsurajofficial@gmail.com",
    name: "Suraj Vishwakarma",
    emailVerified: true,
    activeOrgId: "cmus9c8t50001l204n3pekjdd",
    role: "OWNER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const redirectUrl = new URL(target, req.url).toString();
  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set("pulsesocial_auth_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
