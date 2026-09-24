import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/email/otp";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit/logger";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { memberships: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Verify 6-digit OTP code with 5-minute expiry
    await verifyOTP(user.id, code);

    // Hash the new password with bcrypt salt rounds = 12
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    const activeOrgId = user.memberships[0]?.organizationId;
    if (activeOrgId) {
      await logAudit({
        organizationId: activeOrgId,
        userId: user.id,
        action: "PASSWORD_RESET_SUCCESS",
        resourceType: "User",
        resourceId: user.id,
        details: { method: "email_otp_recovery" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (err: unknown) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
