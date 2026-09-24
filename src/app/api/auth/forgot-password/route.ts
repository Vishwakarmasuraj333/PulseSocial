import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOTP } from "@/lib/email/otp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // For security, don't expose if email doesn't exist, but give a clear message
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a 6-digit recovery code has been sent.",
        email: trimmedEmail,
      });
    }

    // Generate and send 5-minute recovery OTP via Gmail SMTP
    await createAndSendOTP(user.id, user.email, false);

    return NextResponse.json({
      success: true,
      message: "A 6-digit recovery code has been sent to your email address.",
      userId: user.id,
      email: user.email,
    });
  } catch (err: unknown) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to process password recovery." },
      { status: 500 }
    );
  }
}
