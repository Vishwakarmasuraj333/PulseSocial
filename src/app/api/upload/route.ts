import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { uploadBufferToCloudinary } from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Support all modern image and video formats
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "image/heic",
      "image/heif",
    ];

    const validVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-matroska",
      "video/mpeg",
      "video/ogg",
      "video/mp2t",
      "video/3gpp",
    ];

    const isImage = validImageTypes.includes(file.type) || file.type.startsWith("image/");
    const isVideo = validVideoTypes.includes(file.type) || file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: `Unsupported media format (${file.type || "unknown"}). Please upload JPG, PNG, WEBP, GIF, MP4, or WebM.`,
        },
        { status: 400 }
      );
    }

    // Validate size (max 60MB for rich videos and high-res media)
    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size allowed is 60MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Direct Cloudinary upload via streaming buffer (prevents serverless EROFS read-only disk error)
    const uploadResult = await uploadBufferToCloudinary(buffer, {
      filename: file.name,
      mimeType: file.type,
      folder: "pulsesocial/uploads",
      resourceType: isVideo ? "video" : "image",
    });

    // Optionally save to MediaAsset table for workspace asset library
    if (session.activeOrgId) {
      try {
        await prisma.mediaAsset.create({
          data: {
            organizationId: session.activeOrgId,
            fileName: file.name,
            url: uploadResult.url,
            fileType: isVideo ? "VIDEO" : "IMAGE",
            mimeType: file.type,
            sizeBytes: uploadResult.bytes || file.size,
            folder: "uploads",
          },
        });
      } catch (assetErr) {
        // Non-blocking: ensure upload succeeds even if asset catalog indexing is optional
        console.warn("Could not index media asset in workspace catalog:", assetErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileName: file.name,
      size: uploadResult.bytes || file.size,
      mimeType: file.type,
      mediaType: isVideo ? "video" : "image",
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}
