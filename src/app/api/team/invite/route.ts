import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

const InviteSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  emails: z.array(z.string().email("Invalid email")).optional(),
  role: z.string().default("User"),
  channelsAccess: z.string().default("All Channels"),
  isApprover: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    let orgId = session?.activeOrgId;
    let userId = session?.id;

    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) {
        orgId = defaultOrg.id;
      }
    }

    const body = await req.json();
    const validated = InviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, emails, role, channelsAccess, isApprover } = validated.data;
    const targetEmails: string[] = [];
    if (emails && emails.length > 0) {
      targetEmails.push(...emails);
    } else if (email) {
      targetEmails.push(email);
    }

    if (targetEmails.length === 0) {
      return NextResponse.json(
        { error: "At least one email is required" },
        { status: 400 }
      );
    }

    const createdInvites = [];
    for (const em of targetEmails) {
      const token = crypto.randomBytes(24).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

      if (orgId) {
        const invitation = await prisma.teamInvitation.create({
          data: {
            organizationId: orgId,
            email: em.toLowerCase().trim(),
            role,
            channelsAccess,
            isApprover,
            token,
            status: "PENDING",
            expiresAt,
          },
        });
        createdInvites.push(invitation);

        if (userId) {
          await logAudit({
            organizationId: orgId,
            userId,
            action: "TEAM_INVITATION_SENT",
            resourceType: "TeamInvitation",
            resourceId: invitation.id,
            details: { email: em, role, isApprover },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invitations sent to ${targetEmails.join(", ")}`,
      count: targetEmails.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create invitation" },
      { status: 500 }
    );
  }
}
