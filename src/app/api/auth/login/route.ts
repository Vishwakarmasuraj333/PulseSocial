import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAndSendOTP } from "@/lib/email/otp";
import { logAudit } from "@/lib/audit/logger";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
  skipMfa: z.boolean().optional().default(false),
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

    const { email, password, rememberMe } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                socialAccounts: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account is configured with Google Sign In. Please click 'Sign in with Google'." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If email is not yet verified or MFA login is required, send OTP and redirect to verification
    const requireMfa = (!user.emailVerified || process.env.ENABLE_MFA_LOGIN === "true") && !validated.data.skipMfa;
    if (requireMfa) {
      await createAndSendOTP(user.id, user.email);
      return NextResponse.json({
        requiresOtp: true,
        userId: user.id,
        email: user.email,
        message: "A verification code has been sent to your email.",
      });
    }

    let membership = user.memberships[0];
    let org = membership?.organization;

    // Fallback: If user has no workspace organization, create one dynamically
    if (!org) {
      const brandName = user.name ? `${user.name}'s Brand` : "My Brand";
      const slug = `${user.email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
      const newOrg = await prisma.organization.create({
        data: {
          name: brandName,
          slug,
        },
      });

      const newMembership = await prisma.organizationMember.create({
        data: {
          organizationId: newOrg.id,
          userId: user.id,
          role: "OWNER",
          channelsAccess: "ALL",
          isApprover: true,
        },
      });

      org = newOrg as any;
      membership = newMembership as any;
    }

    // Check if organization has social accounts connected
    const hasConnectedAccounts = (org?.socialAccounts?.length || 0) > 0;

    // Create session cookie
    await createSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        activeOrgId: org?.id,
        role: membership?.role || "MEMBER",
      },
      rememberMe
    );

    await logAudit({
      userId: user.id,
      organizationId: org?.id,
      action: "USER_LOGIN",
      resourceType: "User",
      resourceId: user.id,
    });

    const redirectTo = "/dashboard";

    return NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Authentication failed" },
      { status: 500 }
    );
  }
}
