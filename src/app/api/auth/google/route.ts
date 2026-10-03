import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generatePkcePair,
  generateOAuthState,
  generateOAuthNonce,
  buildGoogleAuthUrl,
} from "@/lib/auth/google-oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim().replace(/^["']|["']$/g, "");
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim().replace(/^["']|["']$/g, "");

  // Strict check: if OAuth is not configured, do NOT mock or fake. Inform the developer.
  if (!clientId || !clientSecret) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "google_not_configured");
    loginUrl.searchParams.set(
      "message",
      "Google authentication is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server environment."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Determine authorized redirect URI
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  let redirectUri: string;
  if (isLocal) {
    redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/^["']|["']$/g, "") || `${url.origin}/api/auth/google/callback`;
  } else {
    const configuredProd = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/^["']|["']$/g, "");
    if (configuredProd && !configuredProd.includes("localhost") && !configuredProd.includes("127.0.0.1")) {
      redirectUri = configuredProd;
    } else {
      redirectUri = `${url.origin}/api/auth/google/callback`;
    }
  }

  // Generate cryptographic PKCE, state, and nonce
  const { verifier, challenge } = generatePkcePair();
  const state = generateOAuthState();
  const nonce = generateOAuthNonce();

  // Store in secure HttpOnly cookies
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  cookieStore.set("google_oauth_code_verifier", verifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  cookieStore.set("google_oauth_nonce", nonce, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  // Construct official Google authorization URL
  const googleAuthUrl = buildGoogleAuthUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: challenge,
    nonce,
    scopes: process.env.GOOGLE_OAUTH_SCOPES
      ? process.env.GOOGLE_OAUTH_SCOPES.split(" ")
      : ["openid", "email", "profile"],
  });

  // Redirect browser to Google's real authentication and account chooser page
  const response = NextResponse.redirect(googleAuthUrl);

  // Set directly on the redirect response headers as well for maximum reliability across Next.js runtimes
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  response.cookies.set("google_oauth_code_verifier", verifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  response.cookies.set("google_oauth_nonce", nonce, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
