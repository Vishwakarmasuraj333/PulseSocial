import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  buildCanvaAuthUrl,
  getCanvaCredentials,
} from "@/lib/canva/canvaClient";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { isConfigured, clientId, redirectUri } = getCanvaCredentials();
    const cookieStore = await cookies();

    // Check if user has an active organization
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    });
    const organizationId = org?.id || "default_org";

    const statePayload = {
      csrf: crypto.randomBytes(16).toString("hex"),
      organizationId,
      ts: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    cookieStore.set("pulsesocial_canva_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15, // 15 mins
      sameSite: "lax",
    });

    cookieStore.set("pulsesocial_canva_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
    });

    if (!isConfigured) {
      return NextResponse.json(
        {
          error: "CANVA_CREDENTIALS_MISSING",
          message: "Canva integration credentials (CANVA_CLIENT_ID, CANVA_CLIENT_SECRET) are not configured in .env",
          configured: false,
          redirectUri,
        },
        { status: 400 }
      );
    }

    const authUrl = buildCanvaAuthUrl({
      state,
      codeChallenge,
    });

    // Check if client expects JSON or redirect
    const accept = req.headers.get("accept") || "";
    if (accept.includes("application/json")) {
      return NextResponse.json({
        configured: true,
        authUrl,
      });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Canva connect error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Canva authorization", details: error.message },
      { status: 500 }
    );
  }
}
