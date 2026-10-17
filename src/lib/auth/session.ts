import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "pulsesocial_auth_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
  activeOrgId?: string;
  role?: string;
}

export async function createSession(user: SessionUser, rememberMe = true): Promise<string> {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    activeOrgId: user.activeOrgId,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "30d" : "24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(COOKIE_NAME)?.value ||
      cookieStore.get("pulsesocial_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub as string;
    if (!userId) return null;

    let activeOrgId = (payload.activeOrgId as string) || undefined;
    let role = (payload.role as string) || undefined;

    // Resilient workspace resolution: handle missing or deleted workspaces gracefully
    try {
      if (activeOrgId) {
        const existingMembership = await prisma.organizationMember.findFirst({
          where: { userId, organizationId: activeOrgId },
        });
        if (!existingMembership) {
          activeOrgId = undefined;
          role = undefined;
        } else {
          role = existingMembership.role;
        }
      }

      if (!activeOrgId) {
        const membership = await prisma.organizationMember.findFirst({
          where: { userId },
          orderBy: { createdAt: "asc" },
        });
        if (membership) {
          activeOrgId = membership.organizationId;
          role = membership.role;
        } else {
          // Auto-provision default workspace if user has none
          const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          });
          if (userRecord) {
            const orgName = userRecord.name ? `${userRecord.name}'s Workspace` : "My Workspace";
            const slug =
              (userRecord.name || userRecord.email.split("@")[0] || "workspace")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .slice(0, 30) +
              "-" +
              Math.random().toString(36).substring(2, 7);

            const newOrg = await prisma.organization.create({
              data: {
                name: orgName,
                slug,
                members: {
                  create: {
                    userId,
                    role: "OWNER",
                  },
                },
              },
            });
            activeOrgId = newOrg.id;
            role = "OWNER";
          }
        }
      }
    } catch (dbErr) {
      console.warn("[SESSION_RESOLVE_ORG_FAILED]", dbErr);
    }

    return {
      id: userId,
      email: payload.email as string,
      name: (payload.name as string) || null,
      emailVerified: Boolean(payload.emailVerified),
      activeOrgId,
      role,
    };
  } catch {
    return null;
  }
}

export async function ensureSession(): Promise<SessionUser> {
  const existing = await getSession();
  if (!existing) {
    throw new Error("Unauthorized: Active session required.");
  }
  return existing;
}


export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        status: true,
        memberships: {
          select: {
            id: true,
            role: true,
            organizationId: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                timezone: true,
              },
            },
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };
  cookieStore.set(COOKIE_NAME, "", opts);
  cookieStore.set("pulsesocial_session", "", opts);
  try {
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete("pulsesocial_session");
  } catch {}
}
