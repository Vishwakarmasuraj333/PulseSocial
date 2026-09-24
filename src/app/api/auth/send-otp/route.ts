import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendOTP } from "@/lib/email/otp";
import { logAudit } from "@/lib/audit/logger";

const SendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SendOTPSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const normalizedEmail = validated.data.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user does not exist yet, create a pending user registration
    if (!user) {
      const defaultName = normalizedEmail.split("@")[0];
      const { hashPassword } = await import("@/lib/auth/password");
      const tempHash = await hashPassword(crypto.randomUUID());
      user = await prisma.user.create({
        data: {
          name: defaultName,
          email: normalizedEmail,
          passwordHash: tempHash,
          emailVerified: false,
        } as any,
      });
    }

    // Generate real 6-digit OTP and dispatch via Gmail SMTP
    await createAndSendOTP(user.id, user.email);

    try {
      await logAudit({
        userId: user.id,
        action: "OTP_DISPATCHED",
        resourceType: "User",
        resourceId: user.id,
        details: { email: user.email },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      message: `A 6-digit verification code was sent to ${user.email}`,
    });
  } catch (error: unknown) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to dispatch verification code" },
      { status: 500 }
    );
  }
}
