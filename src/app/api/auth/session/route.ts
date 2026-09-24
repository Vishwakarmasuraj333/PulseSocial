import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const membership = user.memberships[0];
    const u = user as Record<string, any>;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: u.id,
        googleSubjectId: u.googleSubjectId || null,
        email: u.email,
        name: u.name || "User",
        firstName: u.firstName || null,
        lastName: u.lastName || null,
        avatarUrl: u.avatarUrl || null,
        locale: u.locale || null,
        emailVerified: u.emailVerified,
        activeOrganization: membership?.organization || null,
        role: membership?.role || "MEMBER",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
