import { NextResponse } from "next/server";

// Development OTP resolution endpoint is permanently disabled for production security compliance.
// All OTPs are strictly delivered via encrypted SMTP delivery to verified emails.
export async function GET() {
  return NextResponse.json(
    { error: "Endpoint not available. OTP verification is strictly handled via secure email delivery." },
    { status: 404 }
  );
}
