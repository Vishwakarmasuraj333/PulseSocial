import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/email/otp";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

const VerifyOTPSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  code: z.string().length(6, "Verification code must be 6 digits"),
  redirectTo: z.string().optional(),
}).refine((data) => data.userId || data.email, {
  message: "Either userId or email is required",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = VerifyOTPSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, email, code, redirectTo: requestedRedirect } = validated.data;

    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            include: { organization: { include: { socialAccounts: true } } },
          },
        },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          memberships: {
            include: { organization: { include: { socialAccounts: true } } },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify OTP securely
    await verifyOTP(user.id, code);

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Create default organization workspace if none exists
    let orgId = user.memberships[0]?.organizationId;
    if (!orgId) {
      const brandName = user.name ? `${user.name}'s Brand` : "My Brand";
      const baseSlug = user.email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();
      let newOrg = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const nonce = crypto.randomBytes(4).toString("hex");
        const candidateSlug = `${baseSlug}-${nonce}`;
        try {
          newOrg = await prisma.organization.create({
            data: {
              name: brandName,
              slug: candidateSlug,
            },
          });
          break;
        } catch (err: any) {
          if (err?.code === "P2002" && attempt < 4) {
            continue; // Unique constraint collision retry
          }
          throw err;
        }
      }

      if (!newOrg) throw new Error("Failed to generate unique organization slug");

      await prisma.organizationMember.create({
        data: {
          organizationId: newOrg.id,
          userId: user.id,
          role: "OWNER",
          channelsAccess: "ALL",
          isApprover: true,
        },
      });

      orgId = newOrg.id;
    }

    // Create session cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
      activeOrgId: orgId,
      role: "OWNER",
    });

    await logAudit({
      userId: user.id,
      organizationId: orgId,
      action: "EMAIL_VERIFIED_OTP",
      resourceType: "User",
      resourceId: user.id,
    });

    // Link visitor's consent record to the logged in user
    try {
      const cookieStore = await cookies();
      const consentRaw = cookieStore.get("pulsesocial_consent")?.value;
      if (consentRaw) {
        const consentData = JSON.parse(consentRaw);
        const latestAnon = await prisma.consentRecord.findFirst({
          where: { userId: null, policyVersion: consentData.policyVersion },
          orderBy: { timestamp: "desc" },
        });
        if (latestAnon) {
          await prisma.consentRecord.update({
            where: { id: latestAnon.id },
            data: { userId: user.id },
          });
        }
      }
    } catch {}

    const hasExistingOrg = (user.memberships?.length || 0) > 0;
    const targetDestination = requestedRedirect || (hasExistingOrg ? "/dashboard" : "/dashboard?setup=brand");

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      redirectTo: targetDestination,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Invalid or expired verification code" },
      { status: 400 }
    );
  }
}
