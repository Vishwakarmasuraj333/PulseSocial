import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const CURRENT_KEY_VERSION = "v1";

function getEncryptionKey(version: string = CURRENT_KEY_VERSION): Buffer {
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  // Derive distinct 32-byte key seeded by secret and key version for rotation isolation
  return crypto.createHash("sha256").update(`${secret}:${version}`).digest();
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
  keyVersion: string;
}

/**
 * Encrypts sensitive OAuth token using AES-256-GCM authenticated cipher.
 */
export function encryptToken(plainText: string, keyVersion: string = CURRENT_KEY_VERSION): EncryptedPayload {
  if (!plainText) {
    return { encrypted: "", iv: "", tag: "", keyVersion };
  }
  const key = getEncryptionKey(keyVersion);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag,
    keyVersion,
  };
}

/**
 * Decrypts AES-256-GCM token with authentication tag validation.
 * Rejects tampering or invalid keys with an explicit error.
 */
export function decryptToken(
  encryptedHex: string,
  ivHex: string,
  tagHex: string,
  keyVersion: string = CURRENT_KEY_VERSION
): string {
  if (!encryptedHex || !ivHex || !tagHex) {
    return "";
  }
  try {
    const key = getEncryptionKey(keyVersion);
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
      throw new Error("Invalid IV or authentication tag length");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error("Decryption error: Token corrupted, tampered, or invalid key.");
  }
}
