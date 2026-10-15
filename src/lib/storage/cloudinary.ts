import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

/**
 * PulseSocial Cloudinary Storage Client
 * Handles authenticated server-side media uploads, signatures, and asset management.
 * Solves serverless read-only filesystem (EROFS) by storing media on Cloudinary CDN.
 */

// Configure Cloudinary from server environment variables
export function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: "image" | "video" | "raw";
  width?: number;
  height?: number;
  bytes: number;
  duration?: number;
}

/**
 * Uploads a memory buffer directly to Cloudinary using upload_stream.
 * Never writes to local disk, preventing EROFS on Vercel Lambda.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    filename?: string;
    mimeType?: string;
    folder?: string;
    resourceType?: "image" | "video" | "auto";
  } = {}
): Promise<CloudinaryUploadResult> {
  const client = getCloudinaryClient();

  const isVideo =
    options.resourceType === "video" ||
    (options.mimeType && options.mimeType.startsWith("video/")) ||
    (options.filename && Boolean(options.filename.match(/\.(mp4|webm|mov|mkv|avi)$/i)));

  const resourceType = isVideo ? "video" : options.resourceType || "auto";

  let cleanPublicId: string | undefined;
  if (options.filename) {
    const nameWithoutExt = options.filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    cleanPublicId = `${Date.now()}_${nameWithoutExt}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder: options.folder || "pulsesocial/uploads",
        resource_type: resourceType,
        public_id: cleanPublicId,
        overwrite: true,
      },
      (error: any, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(
            new Error(
              `Cloudinary upload failed: ${error?.message || "Unknown error during media processing"}`
            )
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: (result.resource_type as "image" | "video" | "raw") || (isVideo ? "video" : "image"),
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          duration: result.duration,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generates signed parameters for authenticated direct browser uploads.
 */
export function generateSignedUploadParams(options: {
  folder?: string;
  tags?: string;
  resourceType?: "image" | "video" | "auto";
}) {
  const client = getCloudinaryClient();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = options.folder || "pulsesocial/uploads";

  const paramsToSign: Record<string, any> = {
    folder,
    timestamp,
  };

  if (options.tags) {
    paramsToSign.tags = options.tags;
  }

  const signature = client.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    resourceType: options.resourceType || "auto",
  };
}

/**
 * Verifies returned asset signature from direct uploads.
 */
export function verifyUploadSignature(
  params: Record<string, any>,
  expectedSignature: string
): boolean {
  const client = getCloudinaryClient();
  const calculated = client.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
  return calculated === expectedSignature;
}

/**
 * Safely deletes an asset from Cloudinary when no longer referenced.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<boolean> {
  try {
    const client = getCloudinaryClient();
    const res = await client.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res.result === "ok";
  } catch (err) {
    console.warn("Failed to delete Cloudinary asset:", publicId, err);
    return false;
  }
}
