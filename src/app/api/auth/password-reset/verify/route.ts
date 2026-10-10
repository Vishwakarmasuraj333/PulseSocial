import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/email/otp";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification code or email.", code: "AUTH_INVALID_CREDENTIALS" },
        { status: 400 }
      );
    }

    // Verify OTP code
    await verifyOTP(user.id, code);

    return NextResponse.json({
      success: true,
      message: "Recovery code verified. You may now choose a new password.",
      userId: user.id,
      email: user.email,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid or expired recovery code.", code: "OTP_INVALID" },
      { status: 400 }
    );
  }
}
