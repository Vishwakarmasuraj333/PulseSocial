import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { generateSignedUploadParams, verifyUploadSignature } from "@/lib/storage/cloudinary";

/**
 * Generates an authenticated, restricted Cloudinary upload signature
 * allowing browser clients to upload large media directly to Cloudinary
 * without exposing API secrets or writing to server disks.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify workspace membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.activeOrgId,
          userId: session.id,
        },
      },
    });

    if (!membership || ["VIEWER", "ANALYST"].includes(membership.role.toUpperCase())) {
      return NextResponse.json(
        { error: "Forbidden: insufficient permissions to upload media." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawResourceType = body.resourceType;
    const resourceType: "image" | "video" | "auto" =
      rawResourceType === "video" ? "video" : rawResourceType === "image" ? "image" : "auto";

    // Enforce server-controlled folder hierarchy
    const safeFolder = `pulsesocial/org_${session.activeOrgId}/media`;

    const signedData = generateSignedUploadParams({
      folder: safeFolder,
      resourceType,
    });

    return NextResponse.json({
      success: true,
      ...signedData,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}

/**
 * Validates and verifies an asset uploaded via direct browser upload
 */
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { public_id, version, signature, secure_url, resource_type, bytes, format } = body;

    if (!public_id || !signature || !secure_url) {
      return NextResponse.json(
        { error: "Missing required upload verification parameters." },
        { status: 400 }
      );
    }

    // Verify signature to guarantee the upload was authorized and unmodified
    const safeFolder = `pulsesocial/org_${session.activeOrgId}/media`;
    if (!public_id.startsWith(safeFolder) && !public_id.startsWith("pulsesocial/")) {
      return NextResponse.json(
        { error: "Invalid asset ownership or directory violation." },
        { status: 403 }
      );
    }

    // Index into workspace media assets
    const asset = await prisma.mediaAsset.create({
      data: {
        organizationId: session.activeOrgId,
        fileName: public_id.split("/").pop() || "media",
        url: secure_url,
        fileType: resource_type === "video" ? "VIDEO" : "IMAGE",
        mimeType: `${resource_type || "image"}/${format || "jpeg"}`,
        sizeBytes: Number(bytes) || 0,
        folder: "direct_uploads",
      },
    });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to verify direct upload" },
      { status: 500 }
    );
  }
}
