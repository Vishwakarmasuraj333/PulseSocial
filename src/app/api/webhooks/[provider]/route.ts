import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// GET for webhook verification handshake (e.g. Meta hub.challenge)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(req.url);

  if (provider === "facebook" || provider === "instagram") {
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "pulsesocial_meta_verify_token";

    if (mode === "subscribe" && token === expectedToken) {
      return new Response(challenge || "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (provider === "x") {
    // CRC check for Twitter Account Activity API
    const crcToken = searchParams.get("crc_token");
    if (crcToken && process.env.X_CLIENT_SECRET) {
      const hmac = crypto
        .createHmac("sha256", process.env.X_CLIENT_SECRET)
        .update(crcToken)
        .digest("base64");
      return NextResponse.json({ response_token: `sha256=${hmac}` });
    }
  }

  return NextResponse.json({ status: "ok", provider });
}

// POST for webhook events
export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const bodyText = await req.text();

    // Verify signatures where secret is configured
    if (provider === "facebook" || provider === "instagram") {
      const signature = req.headers.get("x-hub-signature-256");
      if (signature && process.env.META_APP_SECRET) {
        const expected = `sha256=${crypto
          .createHmac("sha256", process.env.META_APP_SECRET)
          .update(bodyText)
          .digest("hex")}`;
        if (signature !== expected) {
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
        }
      }
    }

    const payload = JSON.parse(bodyText);
    const eventId = payload.id || payload.event_id || `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventType = payload.object || payload.type || "social_event";

    // Deduplicate and store event
    await prisma.webhookEvent.upsert({
      where: { eventId },
      update: { payload: bodyText },
      create: {
        provider,
        eventId,
        eventType,
        payload: bodyText,
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook ingestion error" }, { status: 500 });
  }
}
