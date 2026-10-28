import { getSession, SessionUser } from "./session";
import { NextResponse } from "next/server";
import { isCompanyAdminEmail } from "./admin-emails";

export { isCompanyAdminEmail, COMPANY_ADMIN_EMAILS } from "./admin-emails";

/**
 * Strict Global System Admin Verification Guard.
 * 
 * Only verified Company Super-Admins are permitted to access the master
 * system console, system health, audit logs, or edit/delete platform users.
 * Regular users with workspace roles (OWNER/ADMIN of their own workspace)
 * are strictly restricted to their own tenant workspace.
 */
export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  session: SessionUser | null;
  errorResponse?: NextResponse;
}> {
  const session = await getSession();
  if (!session?.id) {
    return {
      authorized: false,
      session: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Active session required." },
        { status: 401 }
      ),
    };
  }

  // Strictly check if user is a verified Company Super-Admin
  if (isCompanyAdminEmail(session.email)) {
    return { authorized: true, session };
  }

  return {
    authorized: false,
    session,
    errorResponse: NextResponse.json(
      {
        error:
          "Forbidden: Master administrative privileges are strictly reserved for company administrators.",
      },
      { status: 403 }
    ),
  };
}
