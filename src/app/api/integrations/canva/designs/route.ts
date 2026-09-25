import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getValidCanvaAccessToken,
  listCanvaDesigns,
  createCanvaDesign,
  exportCanvaDesign,
} from "@/lib/canva/canvaClient";

// GET /api/integrations/canva/designs -> Lists real Canva designs
export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const { accessToken, account } = await getValidCanvaAccessToken(org.id);
    const designs = await listCanvaDesigns(accessToken);

    return NextResponse.json({
      designs,
      account: {
        id: account.id,
        displayName: account.displayName,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch Canva designs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch designs from Canva" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/canva/designs -> Creates a new design or exports an existing design
export async function POST(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "create"; // "create" | "export"

    const { accessToken } = await getValidCanvaAccessToken(org.id);

    if (action === "export") {
      const { designId, format } = body;
      if (!designId) {
        return NextResponse.json({ error: "Missing designId for export" }, { status: 400 });
      }

      const result = await exportCanvaDesign(accessToken, designId, format || "jpg");
      return NextResponse.json(result);
    }

    // Otherwise create a design
    const { designType, title } = body;
    const result = await createCanvaDesign(accessToken, designType || "instagram_post", title);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Canva design action failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Canva design action" },
      { status: 500 }
    );
  }
}
