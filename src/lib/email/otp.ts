import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export function generateSecureOTP(): string {
  // Generate a cryptographically secure 6-digit number between 100000 and 999999
  const randomInt = crypto.randomInt(100000, 1000000);
  return randomInt.toString();
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function createAndSendOTP(userId: string, email: string, isResend: boolean = false) {
  // Check resend cooldown only on explicit resend requests
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

  const otp = generateSecureOTP();
  const codeHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

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

  await sendVerificationEmail(email, otp);
  return { success: true, expiresAt };
}

export async function verifyOTP(userId: string, enteredCode: string): Promise<boolean> {
  const latest = await prisma.emailVerificationOTP.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

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
    await prisma.emailVerificationOTP.update({
      where: { id: latest.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Invalid verification code");
  }

  // Delete used OTP
  await prisma.emailVerificationOTP.delete({
    where: { id: latest.id },
  });

  return true;
}

export async function sendVerificationEmail(toEmail: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const from = process.env.EMAIL_FROM || "PulseSocial <noreply@pulsesocial.io>";

  if (process.env.NODE_ENV !== "production") {
    console.log(`[PULSESOCIAL OTP DISPATCH] To: ${toEmail} | Code dispatched`);
  }

  if (!host || !user || !pass) {
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
          <span style="font-size: 22px; font-weight: 800; color: #5846A8; letter-spacing: -0.5px;">PulseSocial</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Verify your email address</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your verification code is:</p>
        <div style="background: #f5f3ff; border: 1.5px dashed #8b5cf6; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #5846A8;">${otp}</span>
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
