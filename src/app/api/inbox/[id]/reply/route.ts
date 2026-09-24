import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

const ReplySchema = z.object({
  message: z.string().min(1, "Reply message cannot be empty"),
  type: z.enum(["COMMENT", "MESSAGE"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = ReplySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
    }

    if (validated.data.type === "COMMENT") {
      await prisma.socialComment.update({
        where: { id },
        data: { isReplied: true, isRead: true },
      });
    } else {
      await prisma.socialMessage.update({
        where: { id },
        data: { isRead: true },
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "INBOX_REPLY_SENT",
      resourceType: validated.data.type === "COMMENT" ? "SocialComment" : "SocialMessage",
      resourceId: id,
    });

    return NextResponse.json({ success: true, message: "Reply sent successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send reply" },
      { status: 500 }
    );
  }
}
