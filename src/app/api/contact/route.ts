import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, category = "SUPPORT" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid business email is required." }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters long." }, { status: 400 });
    }

    // Save contact inquiry to database
    const contact = await (prisma as any).contactRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        category: category.toUpperCase(),
        status: "NEW",
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CONTACT_REQUEST_SUBMITTED",
          resourceType: "ContactRequest",
          resourceId: contact.id,
          details: JSON.stringify({ email: contact.email, subject: contact.subject, category: contact.category }),
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } catch {
      // Non-fatal if audit logging fails
    }

    return NextResponse.json({
      success: true,
      ticketId: contact.id,
      message: "Thank you for reaching out to PulseSocial. Our dedicated enterprise team will review your inquiry within 2 business hours.",
    });
  } catch (error: any) {
    console.error("[API_CONTACT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing your request. Please try again shortly." },
      { status: 500 }
    );
  }
}
