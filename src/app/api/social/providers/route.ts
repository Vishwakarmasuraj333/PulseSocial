import { NextResponse } from "next/server";
import { getAllSocialProviders } from "@/lib/social/registry";
import { PLATFORM_CAPABILITY_MATRIX } from "@/lib/social/types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  const providers = getAllSocialProviders();

  let connectedAccounts: { provider: string; displayName: string; username: string | null; profileImageUrl: string | null; status: string }[] = [];

  if (session?.activeOrgId) {
    connectedAccounts = await prisma.socialAccount.findMany({
      where: { organizationId: session.activeOrgId },
      select: {
        id: true,
        provider: true,
        displayName: true,
        username: true,
        profileImageUrl: true,
        status: true,
      },
    });
  }

  const result = providers.map((p) => {
    const connected = connectedAccounts.find((a) => a.provider === p.platform);
    return {
      ...p,
      isDemoMode: false,
      capabilities: PLATFORM_CAPABILITY_MATRIX[p.platform],
      isConnected: Boolean(connected),
      connectedAccount: connected || null,
    };
  });

  return NextResponse.json({
    providers: result,
    isDemoMode: false,
  });
}
