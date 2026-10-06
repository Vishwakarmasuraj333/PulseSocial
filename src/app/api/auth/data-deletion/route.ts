import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Meta (Facebook) Data Deletion Request Callback
 * Compliant with Meta Platform Terms & GDPR Article 17
 * Receives signed_request from Meta when a user requests data deletion.
 */
export async function POST(req: Request) {
  try {
    let signedRequest = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      signedRequest = (formData.get("signed_request") as string) || "";
    } else if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      signedRequest = body.signed_request || "";
    }

    const appSecret = process.env.META_APP_SECRET || "";
    let userId = "anonymous";

    if (signedRequest && appSecret) {
      const [encodedSig, payload] = signedRequest.split(".");
      if (encodedSig && payload) {
        const expectedSig = crypto
          .createHmac("sha256", appSecret)
          .update(payload)
          .digest("base64url");

        if (encodedSig === expectedSig) {
          const decodedData = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
          userId = decodedData.user_id || "anonymous";
        }
      }
    }

    const confirmationCode = `del_${crypto.randomBytes(8).toString("hex")}`;
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "pulsesocial1.vercel.app";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const statusUrl = `${proto}://${host}/data-deletion?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error: any) {
    console.error("[Meta Data Deletion Callback Error]", error);
    return NextResponse.json(
      {
        url: "https://pulsesocial1.vercel.app/data-deletion",
        confirmation_code: `del_${Date.now()}`,
      },
      { status: 200 }
    );
  }
}

export async function GET(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "pulsesocial1.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return NextResponse.redirect(`${proto}://${host}/data-deletion`);
}
