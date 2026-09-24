import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = await params;
  return NextResponse.json({
    success: true,
    reconnectUrl: `/api/social/${provider}/connect`,
  });
}
