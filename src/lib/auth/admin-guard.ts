import { getSession, SessionUser } from "./session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  session: SessionUser | null;
  errorResponse?: NextResponse;
}> {
  const session = await getSession();
  if (!session?.id) {
    return {
      authorized: false,
      session: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Active session required." },
        { status: 401 }
      ),
    };
  }

  // 1. Direct role check from session
  if (session.role === "OWNER" || session.role === "ADMIN") {
    return { authorized: true, session };
  }

  // 2. Check if user is OWNER or ADMIN in any workspace membership
  const adminMembership = await prisma.organizationMember.findFirst({
    where: {
      userId: session.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });

  if (adminMembership) {
    return { authorized: true, session };
  }

  // 3. System super-admin fallback by email
  const adminEmails = [
    "admin@pulsesocial.io",
    "itsurya9930@gmail.com",
    "itxsurajofficial@gmail.com",
  ];
  if (adminEmails.includes(session.email.toLowerCase())) {
    return { authorized: true, session };
  }

  return {
    authorized: false,
    session,
    errorResponse: NextResponse.json(
      { error: "Forbidden: Administrative privileges required." },
      { status: 403 }
    ),
  };
}
