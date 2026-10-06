import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

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
        { error: `Unsupported media format (${file.type || "unknown"}). Please upload JPG, PNG, WEBP, GIF, MP4, or WebM.` },
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

    // Sanitize filename
    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".png");
    const cleanName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const fileName = `${Date.now()}_${cleanName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      mimeType: file.type,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error: unknown) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
