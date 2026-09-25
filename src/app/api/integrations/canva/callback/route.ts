import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/security/encryption";
import {
  exchangeCanvaCode,
  getCanvaUserProfile,
} from "@/lib/canva/canvaClient";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("pulsesocial_canva_state")?.value;
  const storedVerifier = cookieStore.get("pulsesocial_canva_verifier")?.value;

  // Clean up cookies
  cookieStore.delete("pulsesocial_canva_state");
  cookieStore.delete("pulsesocial_canva_verifier");

  const renderCallbackHtml = (success: boolean, title: string, message: string, accountData?: any) => {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background-color: #0f172a;
      color: #f8fafc;
    }
    .card {
      background: #1e293b;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 440px;
      width: 90%;
      border: 1px solid #334155;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${success ? "linear-gradient(135deg, #00c4cc, #7d2ae7)" : "#ef4444"};
      margin-bottom: 16px;
    }
    h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; }
    p { margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .btn {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 8px;
      background: #3b82f6;
      color: #fff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${
          success
            ? '<path d="M20 6L9 17l-5-5"/>'
            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        }
      </svg>
    </div>
    <h2>${title}</h2>
    <p>${message}</p>
    <button class="btn" onclick="window.close()">Close Window</button>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: "CANVA_CONNECTED",
          success: ${success},
          account: ${JSON.stringify(accountData || null)}
        }, window.location.origin);
        setTimeout(() => {
          window.close();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>`,
      {
        status: success ? 200 : 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  };

  if (errorParam) {
    return renderCallbackHtml(
      false,
      "Canva Authorization Cancelled",
      errorDescription || "Access to your Canva account was not authorized."
    );
  }

  if (!code) {
    return renderCallbackHtml(
      false,
      "Authorization Failed",
      "Missing authorization code from Canva."
    );
  }

  if (!storedState || storedState !== state) {
    return renderCallbackHtml(
      false,
      "Security Validation Failed",
      "OAuth state mismatch or session expired. Please attempt connection again."
    );
  }

  if (!storedVerifier) {
    return renderCallbackHtml(
      false,
      "Verification Failed",
      "PKCE code verifier expired or missing."
    );
  }

  try {
    // 1. Decode state to retrieve target organization
    let organizationId = "default_org";
    try {
      const parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (parsedState.organizationId) {
        organizationId = parsedState.organizationId;
      }
    } catch {}

    // Ensure valid organization
    let org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
    }
    if (!org) {
      throw new Error("No organization found to bind Canva account.");
    }

    // 2. Exchange authorization code for Canva tokens
    const tokens = await exchangeCanvaCode({
      code,
      codeVerifier: storedVerifier,
    });

    // 3. Fetch Canva user profile
    const canvaUser = await getCanvaUserProfile(tokens.access_token);

    // 4. Encrypt tokens for secure persistence
    const encAccess = encryptToken(tokens.access_token);
    const encRefresh = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // 5. Upsert SocialAccount with provider = "canva"
    const account = await prisma.socialAccount.upsert({
      where: {
        organizationId_provider_providerAccountId: {
          organizationId: org.id,
          provider: "canva",
          providerAccountId: canvaUser.id,
        },
      },
      update: {
        displayName: canvaUser.display_name || "Canva Account",
        status: "CONNECTED",
        scopes: JSON.stringify(tokens.scope ? tokens.scope.split(" ") : []),
        tokenExpiresAt,
        lastSyncedAt: new Date(),
      },
      create: {
        organizationId: org.id,
        provider: "canva",
        providerAccountId: canvaUser.id,
        displayName: canvaUser.display_name || "Canva Account",
        username: canvaUser.id,
        status: "CONNECTED",
        scopes: JSON.stringify(tokens.scope ? tokens.scope.split(" ") : []),
        tokenExpiresAt,
      },
    });

    // 6. Upsert encrypted tokens into SocialToken
    await prisma.socialToken.upsert({
      where: {
        socialAccountId: account.id,
      },
      update: {
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh ? encRefresh.encrypted : undefined,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenExpiresAt,
        updatedAt: new Date(),
      },
      create: {
        socialAccountId: account.id,
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh ? encRefresh.encrypted : undefined,
        iv: encAccess.iv,
        tag: encAccess.tag,
        expiresAt: tokenExpiresAt,
      },
    });

    return renderCallbackHtml(
      true,
      "Canva Connected Successfully!",
      `Connected to Canva as "${canvaUser.display_name || "Canva Creator"}". You can now create and import designs seamlessly into PulseSocial.`,
      {
        id: account.id,
        provider: "canva",
        displayName: canvaUser.display_name,
        connectedAt: account.connectedAt,
      }
    );
  } catch (err: any) {
    console.error("Canva OAuth callback error:", err);
    return renderCallbackHtml(
      false,
      "Canva Integration Error",
      err.message || "Failed to finalize Canva integration."
    );
  }
}
