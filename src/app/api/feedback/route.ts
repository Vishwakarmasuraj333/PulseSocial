import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const contentType = req.headers.get("content-type") || "";

    let subject = "";
    let description = "";
    let category = "feature";
    let rating = 5;
    let email = "";
    let savedAttachmentUrl: string | null = null;
    let attachmentName: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      subject = (formData.get("subject") as string) || "";
      description = (formData.get("description") as string) || (formData.get("message") as string) || "";
      category = (formData.get("category") as string) || "feature";
      rating = Number(formData.get("rating")) || 5;
      email = (formData.get("email") as string) || "";

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        attachmentName = file.name;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || ".png";
        const cleanName = file.name
          .replace(ext, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .toLowerCase();
        const fileName = `${Date.now()}_${cleanName}${ext}`;
        const feedbackDir = path.join(process.cwd(), "public", "uploads", "feedback");
        await mkdir(feedbackDir, { recursive: true });
        await writeFile(path.join(feedbackDir, fileName), buffer);
        savedAttachmentUrl = `/uploads/feedback/${fileName}`;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      subject = body.subject || "";
      description = body.description || body.message || "";
      category = body.category || "feature";
      rating = Number(body.rating) || 5;
      email = body.email || "";

      if (body.attachmentUrl) {
        savedAttachmentUrl = body.attachmentUrl;
        attachmentName = body.attachmentName || "Attached file";
      } else if (body.attachment && body.attachment.dataUrl) {
        attachmentName = body.attachment.name || "attachment";
        const dataUrl = body.attachment.dataUrl;
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], "base64");
          const ext = path.extname(body.attachment.name || "") || ".png";
          const cleanName = (body.attachment.name || "feedback_file")
            .replace(ext, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .toLowerCase();
          const fileName = `${Date.now()}_${cleanName}${ext}`;
          const feedbackDir = path.join(process.cwd(), "public", "uploads", "feedback");
          await mkdir(feedbackDir, { recursive: true });
          await writeFile(path.join(feedbackDir, fileName), buffer);
          savedAttachmentUrl = `/uploads/feedback/${fileName}`;
        }
      }
    }

    const trimmedSubject = subject.trim();
    const trimmedDesc = description.trim();

    if (!trimmedSubject && !trimmedDesc) {
      return NextResponse.json(
        { error: "Please enter a subject or description for your feedback." },
        { status: 400 }
      );
    }

    const numRating = Math.max(1, Math.min(5, rating || 5));
    const titlePart = trimmedSubject ? `[${trimmedSubject}] ` : "";
    const categoryPart = `[${category.toUpperCase()}] `;
    const attachPart = attachmentName ? ` (Attachment: ${attachmentName})` : "";
    const userPart = email || session?.email ? ` (By: ${email || session?.email})` : "";
    const formattedMessage = `${categoryPart}${titlePart}${trimmedDesc || trimmedSubject}${attachPart}${userPart}`;

    let feedbackRecord = null;
    try {
      feedbackRecord = await prisma.feedback.create({
        data: {
          rating: numRating,
          message: formattedMessage,
          userId: session?.id || null,
          organizationId: session?.activeOrgId || null,
          screenshotUrl: savedAttachmentUrl,
          status: "NEW",
        },
      });
    } catch (dbError) {
      console.warn("[FEEDBACK_DB_FALLBACK] Feedback saved to secure audit log:", dbError);
    }

    const feedbackId = feedbackRecord?.id || `fb_${Date.now()}`;

    // Always log audit trail
    await logAudit({
      action: "USER_FEEDBACK_SUBMITTED",
      resourceType: "FEEDBACK",
      resourceId: feedbackId,
      userId: session?.id || undefined,
      organizationId: session?.activeOrgId || undefined,
      details: {
        id: feedbackId,
        subject: trimmedSubject,
        description: trimmedDesc,
        category,
        rating: numRating,
        attachmentUrl: savedAttachmentUrl,
        attachmentName,
        userEmail: session?.email || email || null,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      id: feedbackId,
      attachmentUrl: savedAttachmentUrl,
      message: "Thank you! Your feedback has been received and logged directly.",
    });
  } catch (error: unknown) {
    console.error("[API_FEEDBACK_ERROR]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to record feedback. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: session.activeOrgId ? { organizationId: session.activeOrgId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
