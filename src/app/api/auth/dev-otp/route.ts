import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const otpRecord = await prisma.emailVerificationOTP.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "No OTP found" }, { status: 404 });
    }

    // In local development/demo, resolve the 6-digit OTP
    for (let i = 100000; i <= 999999; i++) {
      const s = i.toString();
      if (crypto.createHash("sha256").update(s).digest("hex") === otpRecord.codeHash) {
        return NextResponse.json({ code: s, expiresAt: otpRecord.expiresAt });
      }
    }

    return NextResponse.json({ error: "Code resolution failed" }, { status: 404 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
