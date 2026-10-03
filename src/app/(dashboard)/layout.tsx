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
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      await destroySession();
      redirect("/login");
    }
  } catch (err) {
    // If DB check fails, redirect to login
    redirect("/login");
  }

  return <>{children}</>;
}

