import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { encryptToken, decryptToken } from "@/lib/security/encryption";

const CANVA_AUTH_BASE = "https://www.canva.com/api/oauth/authorize";
const CANVA_API_BASE = "https://api.canva.com/rest/v1";

export interface CanvaTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface CanvaUser {
  id: string;
  display_name?: string;
}

export interface CanvaDesign {
  id: string;
  title?: string;
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
  urls?: {
    edit_url?: string;
    view_url?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function getCanvaCredentials() {
  const clientId = process.env.CANVA_CLIENT_ID || "";
  const clientSecret = process.env.CANVA_CLIENT_SECRET || "";
  const redirectUri = process.env.CANVA_REDIRECT_URI || "http://localhost:3000/api/integrations/canva/callback";
  const isConfigured = Boolean(clientId && clientSecret);
  return { clientId, clientSecret, redirectUri, isConfigured };
}

/**
 * Builds the official Canva OAuth 2.0 authorization URL
 */
export function buildCanvaAuthUrl({
  state,
  codeChallenge,
  customRedirectUri,
}: {
  state: string;
  codeChallenge: string;
  customRedirectUri?: string;
}): string {
  const { clientId, redirectUri } = getCanvaCredentials();
  const targetRedirectUri = customRedirectUri || redirectUri;

  const scopes = [
    "design:meta:read",
    "design:content:read",
    "design:content:write",
    "asset:read",
    "asset:write",
    "profile:read",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: scopes,
    redirect_uri: targetRedirectUri,
    state,
  });

  return `${CANVA_AUTH_BASE}?${params.toString()}`;
}

/**
 * Exchanges authorization code for Canva access & refresh tokens
 */
export async function exchangeCanvaCode({
  code,
  codeVerifier,
  customRedirectUri,
}: {
  code: string;
  codeVerifier: string;
  customRedirectUri?: string;
}): Promise<CanvaTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getCanvaCredentials();
  const targetRedirectUri = customRedirectUri || redirectUri;

  if (!clientId || !clientSecret) {
    throw new Error("Canva credentials (CANVA_CLIENT_ID, CANVA_CLIENT_SECRET) are not configured in environment.");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const bodyParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: targetRedirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(`${CANVA_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: bodyParams.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Canva token exchange failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as CanvaTokenResponse;
}

/**
 * Refreshes an expired Canva access token using the refresh token
 */
export async function refreshCanvaToken(refreshToken: string): Promise<CanvaTokenResponse> {
  const { clientId, clientSecret } = getCanvaCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const bodyParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${CANVA_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: bodyParams.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Canva token refresh failed: ${errorText}`);
  }

  return (await res.json()) as CanvaTokenResponse;
}

/**
 * Fetches user profile from Canva
 */
export async function getCanvaUserProfile(accessToken: string): Promise<CanvaUser> {
  const res = await fetch(`${CANVA_API_BASE}/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    // Fallback if profile endpoint is not enabled on trial app
    return { id: "canva_user_primary", display_name: "Canva Design Creator" };
  }

  const data = await res.json();
  return {
    id: data.profile?.id || data.id || "canva_user",
    display_name: data.profile?.display_name || data.display_name || "Canva Creator",
  };
}

/**
 * Helper to retrieve an active, valid Canva access token for the organization
 */
export async function getValidCanvaAccessToken(organizationId: string): Promise<{
  accessToken: string;
  account: any;
}> {
  const account = await prisma.socialAccount.findFirst({
    where: {
      organizationId,
      provider: "canva",
      status: "CONNECTED",
    },
    include: { token: true },
  });

  if (!account || !account.token) {
    throw new Error("No connected Canva account found for this organization.");
  }

  const isExpired = account.tokenExpiresAt ? account.tokenExpiresAt.getTime() <= Date.now() + 60000 : false;

  let accessToken = decryptToken(
    account.token.encryptedAccessToken,
    account.token.iv,
    account.token.tag
  );

  if (isExpired && account.token.encryptedRefreshToken) {
    const refreshToken = decryptToken(
      account.token.encryptedRefreshToken,
      account.token.iv,
      account.token.tag
    );
    try {
      const refreshed = await refreshCanvaToken(refreshToken);
      accessToken = refreshed.access_token;

      const enc = encryptToken(refreshed.access_token);
      let encRefresh = refreshed.refresh_token ? encryptToken(refreshed.refresh_token) : null;

      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
          lastSyncedAt: new Date(),
        },
      });

      await prisma.socialToken.update({
        where: { socialAccountId: account.id },
        data: {
          encryptedAccessToken: enc.encrypted,
          encryptedRefreshToken: encRefresh ? encRefresh.encrypted : account.token.encryptedRefreshToken,
          iv: enc.iv,
          tag: enc.tag,
          expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        },
      });
    } catch (err) {
      console.warn("Could not refresh Canva token, attempting with existing token:", err);
    }
  }

  return { accessToken, account };
}

/**
 * Lists designs created in Canva
 */
export async function listCanvaDesigns(accessToken: string): Promise<CanvaDesign[]> {
  const res = await fetch(`${CANVA_API_BASE}/designs`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list Canva designs: ${text}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled Design",
    thumbnail: item.thumbnail ? { url: item.thumbnail.url, width: item.thumbnail.width, height: item.thumbnail.height } : undefined,
    urls: item.urls ? { edit_url: item.urls.edit_url, view_url: item.urls.view_url } : undefined,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

/**
 * Creates a brand new Canva design
 */
export async function createCanvaDesign(
  accessToken: string,
  designType: "instagram_post" | "facebook_post" | "twitter_post" | "social_story" = "instagram_post",
  title?: string
): Promise<{ id: string; edit_url: string }> {
  const designTypePresets: Record<string, { width: number; height: number }> = {
    instagram_post: { width: 1080, height: 1080 },
    facebook_post: { width: 1200, height: 630 },
    twitter_post: { width: 1200, height: 675 },
    social_story: { width: 1080, height: 1920 },
  };

  const preset = designTypePresets[designType] || { width: 1080, height: 1080 };

  const res = await fetch(`${CANVA_API_BASE}/designs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_type: {
        type: "custom",
        width: preset.width,
        height: preset.height,
      },
      title: title || `PulseSocial - ${designType.replace("_", " ").toUpperCase()}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create Canva design: ${text}`);
  }

  const data = await res.json();
  return {
    id: data.design?.id || data.id,
    edit_url: data.design?.urls?.edit_url || data.urls?.edit_url || `https://www.canva.com/design/${data.id || ""}`,
  };
}

/**
 * Triggers export of a Canva design to a downloadable PNG/JPG URL
 */
export async function exportCanvaDesign(
  accessToken: string,
  designId: string,
  format: "jpg" | "png" = "jpg"
): Promise<{ downloadUrl: string }> {
  // 1. Initiate export job
  const initRes = await fetch(`${CANVA_API_BASE}/exports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_id: designId,
      format: {
        type: format,
        quality: 90,
      },
    }),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Failed to initiate Canva export: ${err}`);
  }

  const initData = await initRes.json();
  const exportId = initData.job?.id || initData.id;

  if (!exportId) {
    throw new Error("No export job ID returned from Canva.");
  }

  // 2. Poll for completion (up to 30 seconds)
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollRes = await fetch(`${CANVA_API_BASE}/exports/${exportId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (pollRes.ok) {
      const pollData = await pollRes.json();
      const status = pollData.job?.status || pollData.status;

      if (status === "success") {
        const urls = pollData.job?.urls || pollData.urls || [];
        if (urls.length > 0) {
          return { downloadUrl: urls[0] };
        }
      } else if (status === "failed") {
        throw new Error(pollData.job?.error?.message || "Canva design export failed.");
      }
    }
  }

  throw new Error("Canva design export timed out. Please try again.");
}
