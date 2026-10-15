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
    return NextResponse.json({ error: "Social Account ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!["CONNECTED", "DISCONNECTED", "RECONNECT_REQUIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const acc = await tx.socialAccount.update({
        where: { id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: acc.organizationId,
          action: "ADMIN_ACCOUNT_STATUS_CHANGED",
          resourceType: "SocialAccount",
          resourceId: id,
          details: JSON.stringify({ newStatus: status, provider: acc.provider }),
        },
      });

      return acc;
    });

    return NextResponse.json({
      success: true,
      account: updated,
      message: `Account status updated to ${status}.`,
    });
  } catch (error: any) {
    console.error("[ADMIN_ACCOUNT_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update social account.", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Social Account ID is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.socialAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Social account not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: existing.organizationId,
          action: "ADMIN_ACCOUNT_DISCONNECTED",
          resourceType: "SocialAccount",
          resourceId: id,
          details: JSON.stringify({
            provider: existing.provider,
            displayName: existing.displayName,
          }),
        },
      });

      await tx.socialAccount.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Account ${existing.displayName} (${existing.provider}) disconnected and removed.`,
    });
  } catch (error: any) {
    console.error("[ADMIN_ACCOUNT_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete social account.", details: error.message },
      { status: 500 }
    );
  }
}
