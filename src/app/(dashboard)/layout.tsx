import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const currentPath = reqHeaders.get("x-pathname") || "";
  const loginRedirectUrl =
    currentPath && currentPath !== "/dashboard" && !currentPath.startsWith("/login")
      ? `/login?redirectTo=${encodeURIComponent(currentPath)}`
      : "/login";

  const session = await getSession();

  if (!session || !session.id) {
    redirect(loginRedirectUrl);
  }

  // Double check user exists and is active in database
  let isAuthorized = false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, status: true, emailVerified: true },
    });

    if (user && user.status === "ACTIVE" && user.emailVerified) {
      isAuthorized = true;
    }
  } catch (err) {
    console.warn("[AUTH_DASHBOARD_CHECK_FAILED]", err);
    if (session.emailVerified) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    await destroySession().catch(() => {});
    redirect(loginRedirectUrl);
  }

  return <>{children}</>;
}
