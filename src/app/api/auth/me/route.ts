import { NextResponse } from "next/server";
import { getCurrentUser, getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

  const session = await getSession();
  const membership =
    user.memberships.find((m) => m.organizationId === session?.activeOrgId) ||
    user.memberships[0];

  const fallbackName = user.name || (user.email ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "User");

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: fallbackName,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          activeOrganization: membership?.organization || null,
          role: membership?.role || session?.role || "OWNER",
        },
      },
      { headers }
    );
  } catch {
    return NextResponse.json(
      { user: null },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
