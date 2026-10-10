import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

// Routes that strictly require active session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/ai",
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

// Auth routes where authenticated users should be redirected to dashboard unless they ask to log out/switch
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(req: any) {
  const { pathname, searchParams } = req.nextUrl;

  const sessionCookie = req.cookies.get("pulsesocial_auth_session")?.value;
  let isAuthenticated = false;
  let isEmailVerified = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload && payload.sub) {
        isAuthenticated = true;
        isEmailVerified = Boolean(payload.emailVerified);
      }
    } catch {
      isAuthenticated = false;
      isEmailVerified = false;
    }
  }

  // If visiting with ?logout=true or ?force=true, aggressively clear session cookies across all routes
  if (searchParams.get("logout") === "true" || searchParams.has("force") || searchParams.get("switch") === "true") {
    const res = NextResponse.next();
    const isProd = process.env.NODE_ENV === "production" || req.url.startsWith("https:");
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    };
    res.cookies.delete("pulsesocial_auth_session");
    res.cookies.delete("pulsesocial_session");
    res.cookies.set("pulsesocial_auth_session", "", cookieOpts);
    res.cookies.set("pulsesocial_session", "", cookieOpts);
    return res;
  }

  // If visiting the root of the app (/), ALWAYS show the frontend marketing landing page!
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check if requested route requires authentication
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && (!isAuthenticated || !isEmailVerified)) {
    const loginUrl = new URL("/login", req.url);
    if (isAuthenticated && !isEmailVerified) {
      loginUrl.searchParams.set("error", "email_not_verified");
      loginUrl.searchParams.set("message", "Please verify your email address to access workspace features.");
    } else {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    const res = NextResponse.redirect(loginUrl);
    if (!isAuthenticated && sessionCookie) {
      const isProd = process.env.NODE_ENV === "production" || req.url.startsWith("https:");
      const cookieOpts = {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      };
      res.cookies.set("pulsesocial_auth_session", "", cookieOpts);
      res.cookies.set("pulsesocial_session", "", cookieOpts);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
