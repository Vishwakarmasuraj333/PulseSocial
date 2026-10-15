import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // 'feedback', 'contact', 'all'
    const status = searchParams.get("status")?.trim() || "";

    const [feedbackItems, contactRequests] = await Promise.all([
      type === "contact"
        ? []
        : prisma.feedback.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: "desc" },
            take: 50,
          }),
      type === "feedback"
        ? []
        : prisma.contactRequest.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: "desc" },
            take: 50,
          }),
    ]);

    return NextResponse.json({
      feedback: feedbackItems,
      contacts: contactRequests,
      counts: {
        totalFeedback: feedbackItems.length,
        totalContacts: contactRequests.length,
        pendingFeedback: feedbackItems.filter((f) => f.status === "NEW").length,
        pendingContacts: contactRequests.filter((c) => c.status === "PENDING").length,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_FEEDBACK_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback and requests.", details: error.message },
      { status: 500 }
    );
  }
}
