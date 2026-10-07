import crypto from "crypto";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Base64URL encoding without padding
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generates PKCE code_verifier and code_challenge (S256)
 */
export function generatePkcePair() {
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

/**
 * Generates a cryptographically secure random state parameter for CSRF mitigation
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a cryptographically secure nonce for OpenID Connect replay protection
 */
export function generateOAuthNonce(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Constructs the official Google OAuth 2.0 authorization URL
 */
export function buildGoogleAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  nonce?: string;
  scopes?: string[];
}): string {
  const scopeList = params.scopes || ["openid", "email", "profile"];
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: scopeList.join(" "),
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
  });

  if (params.nonce) {
    searchParams.set("nonce", params.nonce);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
}

/**
 * Exchanges the Google authorization code for access and ID tokens
 */
export async function exchangeGoogleAuthCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code",
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || "Failed to exchange authorization code with Google"
    );
  }

  return data as GoogleTokenResponse;
}

/**
 * Retrieves the authenticated user's real OpenID Connect identity from Google
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.sub) {
    throw new Error(
      data.error_description || data.error || "Failed to fetch Google user profile"
    );
  }

  return data as GoogleUserInfo;
}

/**
 * Calculates the exact canonical Google redirect URI for the request
 */
export function getGoogleRedirectUri(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const isLocal = !host || host.includes("localhost") || host.includes("127.0.0.1");

  if (isLocal) {
    const configured = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/^["']|["']$/g, "");
    if (configured && (configured.includes("localhost") || configured.includes("127.0.0.1"))) {
      return configured;
    }
    const origin = host ? `http://${host}` : "http://localhost:3000";
    return `${origin}/api/auth/google/callback`;
  }

  // Production environment (Vercel or custom domain)
  // Check if an explicit production redirect URI is configured in environment
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/^["']|["']$/g, "");
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured;
  }

  // Fallback to https://<host>/api/auth/google/callback
  return `https://${host}/api/auth/google/callback`;
}
