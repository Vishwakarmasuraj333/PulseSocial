import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendOTP } from "@/lib/email/otp";

const ResendSchema = z
  .object({
    userId: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email is required",
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ResendSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
    }

    const { userId, email } = validated.data;

    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // Dispatch fresh 6-digit OTP via Gmail SMTP
    await createAndSendOTP(user.id, user.email, true);

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      message: `A fresh 6-digit verification code has been dispatched to ${user.email}`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to resend code" },
      { status: 400 }
    );
  }
}

