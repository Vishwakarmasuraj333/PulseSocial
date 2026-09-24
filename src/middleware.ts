import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

// Routes that strictly require active session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/compose",
  "/inbox",
  "/posts",
  "/calendar",
  "/messages",
  "/monitor",
  "/analytics",
  "/team",
  "/settings",
  "/media",
  "/connections",
  "/reports",
  "/automation",
  "/collaborate",
  "/approvals",
  "/drafts",
  "/social-accounts",
  "/ai-assistant",
];

// Auth routes where authenticated users should be redirected to dashboard
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get("pulsesocial_session")?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload && payload.sub) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // If visiting the root of the app, send to /login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if requested route requires authentication
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/compose/:path*",
    "/inbox/:path*",
    "/posts/:path*",
    "/calendar/:path*",
    "/messages/:path*",
    "/monitor/:path*",
    "/analytics/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/media/:path*",
    "/connections/:path*",
    "/reports/:path*",
    "/automation/:path*",
    "/collaborate/:path*",
    "/approvals/:path*",
    "/drafts/:path*",
    "/social-accounts/:path*",
    "/ai-assistant/:path*",
    "/login",
    "/signup",
    "/",
  ],
};
