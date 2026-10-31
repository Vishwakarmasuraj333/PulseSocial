import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isCompanyAdminEmail } from "@/lib/auth/admin-emails";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

// Public marketing & legal pages that any unauthenticated visitor is allowed to view
const PUBLIC_EXACT_ROUTES = new Set([
  "/",
  "/home",
  "/about",
  "/features",
  "/pricing",
  "/platforms",
  "/resources",
  "/solutions",
  "/contact",
  "/terms",
  "/privacy",
  "/cookie-policy",
  "/data-deletion",
  "/blog",
  "/changelog",
  "/manifest.json",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-otp",
]);

const PUBLIC_PREFIXES = [
  "/blog/",
  "/docs/",
  "/videos/",
  "/api/auth/",
  "/api/webhooks/",
  "/api/health/",
  "/api/consent",
  "/api/dev-login",
  "/icons/",
  "/images/",
  "/fonts/",
  "/_next/",
];

// Auth routes where already-logged-in users should be sent directly to /dashboard
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// All protected dashboard & internal route prefixes (100% strict coverage)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/posts",
  "/analytics",
  "/social-accounts",
  "/calendar",
  "/inbox",
  "/ai",
  "/ai-assistant",
  "/compose",
  "/settings",
  "/billing",
  "/team",
  "/approvals",
  "/drafts",
  "/scheduled",
  "/published",
  "/automation",
  "/media",
  "/connections",
  "/reports",
  "/collaborate",
  "/messages",
  "/monitor",
  "/brand-boards",
  "/canva",
  "/comments",
  "/links",
  "/mentions",
  "/notifications",
  "/snippets",
  "/social-planner",
  "/trigger-links",
  "/onboarding",
  "/admin",
  "/social/connect",
];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Session Token Discovery (supports both pulsesocial_auth_session and pulsesocial_session)
  const sessionCookie =
    req.cookies.get("pulsesocial_auth_session")?.value ||
    req.cookies.get("pulsesocial_session")?.value;

  let isAuthenticated = false;
  let isEmailVerified = false;
  let sessionEmail = "";

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload && payload.sub) {
        isAuthenticated = true;
        // Verified if emailVerified is true or not explicitly false
        isEmailVerified = payload.emailVerified !== false;
        sessionEmail = typeof payload.email === "string" ? payload.email : "";
      }
    } catch {
      isAuthenticated = false;
      isEmailVerified = false;
      sessionEmail = "";
    }
  }

  // 2. Cookie Cleanup Helper
  const clearAuthCookies = (res: NextResponse) => {
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
  };

  // 3. Explicit Logout or Switch Request: wipe session and redirect to /login
  if (
    searchParams.get("logout") === "true" ||
    searchParams.has("force") ||
    searchParams.get("switch") === "true"
  ) {
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    return clearAuthCookies(res);
  }

  // 3.5. Instant Registration Redirect (/register -> /signup)
  if (pathname === "/register") {
    const signupUrl = new URL("/signup", req.url);
    searchParams.forEach((val, key) => signupUrl.searchParams.set(key, val));
    return NextResponse.redirect(signupUrl);
  }

  // 4. Exact Root Homepage (Always Public Landing Page)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 5. Determine if Route is Public
  const isPublicRoute =
    PUBLIC_EXACT_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 6. Determine if Route is Protected (explicit prefix match or any non-public page)
  const isProtectedRoute =
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) || !isPublicRoute;

  // 7. If Protected Route and NOT Authenticated / NOT Verified -> STRICT REDIRECT TO /login
  if (isProtectedRoute && (!isAuthenticated || !isEmailVerified)) {
    const loginUrl = new URL("/login", req.url);
    if (isAuthenticated && !isEmailVerified) {
      loginUrl.searchParams.set("error", "email_not_verified");
      loginUrl.searchParams.set(
        "message",
        "Please verify your email address to access workspace features."
      );
    } else {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    const res = NextResponse.redirect(loginUrl);
    if (!isAuthenticated && sessionCookie) {
      clearAuthCookies(res);
    }
    return res;
  }

  // 8. STRICT SYSTEM ADMIN GUARD: Only Company Super-Admins can access /admin routes
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isCompanyAdminEmail(sessionEmail)) {
      const dashboardUrl = new URL("/dashboard", req.url);
      dashboardUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 9. If Visiting Auth Pages (/login, /signup) While Already Authenticated -> Send to /dashboard
  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (isAuthenticated && isEmailVerified) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.json|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|mp4|webm|woff2|woff|ttf)).*)",
  ],
};
