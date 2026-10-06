import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.id) {
    redirect("/login");
  }

  // Double check user exists and is active in database
  let isAuthorized = false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, status: true },
    });

    if (user && user.status === "ACTIVE") {
      isAuthorized = true;
    }
  } catch (err) {
    console.warn("[AUTH_DASHBOARD_CHECK_FAILED]", err);
    isAuthorized = false;
  }

  if (!isAuthorized) {
    await destroySession().catch(() => {});
    redirect("/login");
  }

  return <>{children}</>;
}
