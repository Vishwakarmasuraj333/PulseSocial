import { NextResponse } from "next/server";

/**
 * Direct passwordless Google email login is disabled for production security.
 * All Google authentications must go through verified OAuth 2.0 + PKCE (/api/auth/google).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Direct unverified Google sign-in is disabled. Use /api/auth/google for official OAuth 2.0 authentication.",
      code: "DIRECT_GOOGLE_AUTH_DISABLED",
    },
    { status: 410 }
  );
}
