import { NextResponse } from "next/server";
import { getCurrentUser, getSession } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await getSession();
  const membership =
    user.memberships.find((m) => m.organizationId === session?.activeOrgId) ||
    user.memberships[0];

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      activeOrganization: membership?.organization || null,
      role: membership?.role || "MEMBER",
    },
  });
}
