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

  if (provider === "facebook" || provider === "instagram" || provider === "whatsapp") {
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
    if (provider === "facebook" || provider === "instagram" || provider === "whatsapp") {
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

    // Ingest authentic webhook events into SocialComment and SocialMessage
    if (Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (provider === "whatsapp") {
          // Dedicated WhatsApp Cloud API Webhook Handling
          if (Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.field === "messages" && change.value) {
                const val = change.value;
                const phoneId = val.metadata?.phone_number_id || entry.id;

                const waAccount = await prisma.socialAccount.findFirst({
                  where: {
                    provider: "whatsapp",
                    OR: [
                      { providerAccountId: phoneId },
                      { providerAccountId: entry.id },
                    ],
                  },
                });

                if (waAccount && Array.isArray(val.messages)) {
                  for (const msg of val.messages) {
                    const mid = msg.id;
                    const contact = val.contacts?.find((c: any) => c.wa_id === msg.from);
                    const senderName = contact?.profile?.name || msg.from || "WhatsApp Customer";
                    const bodyText = msg.text?.body || (msg.type ? `[WhatsApp ${msg.type}]` : "Message");

                    const existing = await prisma.socialMessage.findFirst({
                      where: { platformMessageId: mid },
                    });
                    if (!existing) {
                      await prisma.socialMessage.create({
                        data: {
                          socialAccountId: waAccount.id,
                          platformMessageId: mid,
                          senderName,
                          senderUsername: msg.from || null,
                          content: bodyText,
                          sentAt: msg.timestamp ? new Date(parseInt(msg.timestamp, 10) * 1000) : new Date(),
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        } else {
          // Facebook & Instagram
          const targetAccountId = entry.id;
          const account = await prisma.socialAccount.findFirst({
            where: {
              provider,
              providerAccountId: targetAccountId,
            },
          });

          if (account) {
            // 1. Ingest Comments
            if (Array.isArray(entry.changes)) {
              for (const change of entry.changes) {
                if (change.field === "feed" && change.value?.item === "comment") {
                  const commentId = change.value.comment_id;
                  const authorName = change.value.from?.name || "Social Follower";
                  const content = change.value.message || "";
                  if (commentId && content) {
                    const existing = await prisma.socialComment.findFirst({
                      where: { platformCommentId: commentId },
                    });
                    if (!existing) {
                      await prisma.socialComment.create({
                        data: {
                          socialAccountId: account.id,
                          platformCommentId: commentId,
                          platformPostId: change.value.post_id || null,
                          authorName,
                          authorUsername: change.value.from?.id || null,
                          content,
                          postedAt: change.value.created_time ? new Date(change.value.created_time * 1000) : new Date(),
                        },
                      });
                    }
                  }
                }
              }
            }

            // 2. Ingest Inbound Direct Messages
            if (Array.isArray(entry.messaging)) {
              for (const msg of entry.messaging) {
                if (msg.message && msg.message.text) {
                  const mid = msg.message.mid || `${msg.sender?.id}_${msg.timestamp}`;
                  const existing = await prisma.socialMessage.findFirst({
                    where: { platformMessageId: mid },
                  });
                  if (!existing) {
                    await prisma.socialMessage.create({
                      data: {
                        socialAccountId: account.id,
                        platformMessageId: mid,
                        senderName: msg.sender?.name || `Customer ${msg.sender?.id?.substring(0, 6) || ""}`,
                        senderUsername: msg.sender?.id || null,
                        content: msg.message.text,
                        sentAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, eventId });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook ingestion error" }, { status: 500 });
  }
}
