import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, type } = body; // type is 'feedback' or 'contact'

    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    if (type === "contact") {
      const contact = await prisma.contactRequest.findUnique({ where: { id } });
      if (!contact) {
        return NextResponse.json({ error: "Contact request not found." }, { status: 404 });
      }

      const updated = await prisma.contactRequest.update({
        where: { id },
        data: { status },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_CONTACT_STATUS_UPDATED",
          resourceType: "ContactRequest",
          resourceId: id,
          details: JSON.stringify({ newStatus: status, email: contact.email }),
        },
      });

      return NextResponse.json({ success: true, updated });
    } else {
      // Default: feedback
      const feedback = await prisma.feedback.findUnique({ where: { id } });
      if (!feedback) {
        return NextResponse.json({ error: "Feedback item not found." }, { status: 404 });
      }

      const updated = await prisma.feedback.update({
        where: { id },
        data: { status },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_FEEDBACK_STATUS_UPDATED",
          resourceType: "Feedback",
          resourceId: id,
          details: JSON.stringify({ newStatus: status }),
        },
      });

      return NextResponse.json({ success: true, updated });
    }
  } catch (error: any) {
    console.error("[ADMIN_FEEDBACK_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update status.", details: error.message },
      { status: 500 }
    );
  }
}
