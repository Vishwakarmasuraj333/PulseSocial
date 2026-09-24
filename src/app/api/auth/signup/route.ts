import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAndSendOTP } from "@/lib/email/otp";
import { logAudit } from "@/lib/audit/logger";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service",
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SignupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        emailVerified: false,
      },
    });

    // Generate and dispatch 6-digit OTP
    await createAndSendOTP(user.id, user.email);

    await logAudit({
      userId: user.id,
      action: "USER_SIGNUP",
      resourceType: "User",
      resourceId: user.id,
      details: { email: user.email },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email with the OTP sent.",
        userId: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
