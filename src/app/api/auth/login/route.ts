import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAndSendOTP } from "@/lib/email/otp";
import { logAudit } from "@/lib/audit/logger";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please check your email or sign up." },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password not set for this account. Please sign in with Google or reset password." },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // MANDATORY OTP: Generate and dispatch 6-digit verification code to user's email via Gmail SMTP
    await createAndSendOTP(user.id, user.email);

    try {
      await logAudit({
        userId: user.id,
        action: "LOGIN_OTP_DISPATCHED",
        resourceType: "User",
        resourceId: user.id,
        details: { email: user.email },
      });
    } catch {}

    // DO NOT CREATE SESSION HERE!
    // Session is created ONLY after OTP is verified via /api/auth/verify-otp
    return NextResponse.json({
      success: true,
      requiresOtp: true,
      userId: user.id,
      email: user.email,
      message: `A 6-digit verification code was sent to ${user.email}`,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Authentication failed" },
      { status: 500 }
    );
  }
}

