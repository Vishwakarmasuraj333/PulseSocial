import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit/logger";

const ChangePasswordSchema = z.object({
  current: z.string().min(1, "Current password is required"),
  new: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = ChangePasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { current, new: newPassword } = validated.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser?.passwordHash) {
      return NextResponse.json(
        { error: "User account has no password set" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(current, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    // Hash and update new password
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    const membership = user.memberships[0];
    await logAudit({
      userId: user.id,
      organizationId: membership?.organizationId,
      action: "USER_PASSWORD_CHANGE",
      resourceType: "User",
      resourceId: user.id,
    });

    return NextResponse.json({ success: true, message: "Password successfully updated" });
  } catch (error: unknown) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to change password" },
      { status: 500 }
    );
  }
}
