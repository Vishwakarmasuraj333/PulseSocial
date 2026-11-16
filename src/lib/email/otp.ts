import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Resilient memory store for offline DB fallback
const memoryOtpStore = new Map<
  string,
  { codeHash: string; expiresAt: Date; attempts: number; createdAt: Date }
>();

export function generateSecureOTP(): string {
  // Generate a cryptographically secure 6-digit number between 100000 and 999999
  const randomInt = crypto.randomInt(100000, 1000000);
  return randomInt.toString();
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function createAndSendOTP(userId: string, email: string, isResend: boolean = false) {
  let isDbOk = true;

  try {
    const latestOTP = await prisma.emailVerificationOTP.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (latestOTP && isResend) {
      const elapsedSeconds = (Date.now() - new Date(latestOTP.createdAt).getTime()) / 1000;
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
        throw new Error(`Please wait ${waitTime} seconds before requesting a new code.`);
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("Please wait")) throw err;
    isDbOk = false;
  }

  const otp = generateSecureOTP();
  const codeHash = hashOTP(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  if (isDbOk) {
    try {
      // Invalidate any older OTPs for this user
      await prisma.emailVerificationOTP.deleteMany({
        where: { userId },
      });

      await prisma.emailVerificationOTP.create({
        data: {
          userId,
          codeHash,
          expiresAt,
          attempts: 0,
        },
      });
    } catch {
      // Fall back to memory
      memoryOtpStore.set(userId, { codeHash, expiresAt, attempts: 0, createdAt: now });
      memoryOtpStore.set(email.toLowerCase().trim(), { codeHash, expiresAt, attempts: 0, createdAt: now });
    }
  } else {
    memoryOtpStore.set(userId, { codeHash, expiresAt, attempts: 0, createdAt: now });
    memoryOtpStore.set(email.toLowerCase().trim(), { codeHash, expiresAt, attempts: 0, createdAt: now });
  }

  await sendVerificationEmail(email, otp);
  return { success: true, expiresAt };
}

export async function verifyOTP(userIdOrEmail: string, enteredCode: string): Promise<boolean> {
  const normalizedKey = userIdOrEmail.toLowerCase().trim();
  let latest: { id?: string; codeHash: string; expiresAt: Date; attempts: number } | null = null;
  let isFromDb = false;

  try {
    const dbRecord = await prisma.emailVerificationOTP.findFirst({
      where: { userId: userIdOrEmail },
      orderBy: { createdAt: "desc" },
    });
    if (dbRecord) {
      latest = dbRecord;
      isFromDb = true;
    }
  } catch {
    // DB offline, check memory
  }

  if (!latest) {
    latest = memoryOtpStore.get(userIdOrEmail) || memoryOtpStore.get(normalizedKey) || null;
  }

  if (!latest) {
    throw new Error("This verification code has already been used. Please request a new code.");
  }

  if (new Date() > new Date(latest.expiresAt)) {
    throw new Error("This OTP has expired. Please request a new code.");
  }

  if (latest.attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Please request a new OTP.");
  }

  const enteredHash = hashOTP(enteredCode.trim());
  if (enteredHash !== latest.codeHash) {
    if (isFromDb && latest.id) {
      await prisma.emailVerificationOTP.update({
        where: { id: latest.id },
        data: { attempts: { increment: 1 } },
      }).catch(() => {});
    } else {
      latest.attempts += 1;
    }
    throw new Error("Invalid verification code");
  }

  // Securely invalidate and remove consumed OTP to prevent replay attacks
  if (isFromDb && latest.id) {
    await prisma.emailVerificationOTP.delete({
      where: { id: latest.id },
    }).catch(() => {});
  }
  memoryOtpStore.delete(userIdOrEmail);
  memoryOtpStore.delete(normalizedKey);

  return true;
}

export async function sendVerificationEmail(toEmail: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "PulseSocial <noreply@pulsesocial.io>";

  // Log dispatch event clearly in server console
  console.log(`\n==================================================`);
  console.log(`🔐 [PULSESOCIAL VERIFICATION CODE]: >> ${otp} <<`);
  console.log(`📧 Recipient: ${toEmail}`);
  console.log(`==================================================\n`);

  // Check if real SMTP credentials are provided
  const isPlaceholder = !host || !user || !pass || user.includes("your-email@gmail.com") || pass.includes("your-16-char");

  if (isPlaceholder) {
    if (process.env.NODE_ENV === "production" && (!host || !user || !pass)) {
      throw new Error(
        "SMTP configuration missing in production: SMTP_HOST, SMTP_USER, and SMTP_PASS/SMTP_PASSWORD are required. Email dispatch aborted."
      );
    }
    console.warn(
      `[SMTP Notice] Using development OTP (${otp}) for ${toEmail}. Configure SMTP in .env for inbox delivery.`
    );
    return;
  }

  try {
    const isPort465 = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isPort465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 800; color: #E08738; letter-spacing: -0.5px;">PulseSocial</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Verify your email address</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your verification code is:</p>
        <div style="background: #fffbeb; border: 1.5px dashed #F59E0B; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #B45309;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code expires in 5 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 16px;">If you did not request this code, you can safely ignore this email.</p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
          © 2026 PulseSocial. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Your PulseSocial verification code",
      html: mailHtml,
    });
    console.log(`[SMTP] Successfully sent OTP email to ${toEmail}`);
  } catch (err: unknown) {
    console.error("[SMTP Error] Failed to send email via SMTP:", (err as Error).message);
    throw new Error("Unable to send OTP. Please check email delivery configuration or try again.");
  }
}
