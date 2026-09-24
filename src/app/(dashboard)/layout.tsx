import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.id) {
    redirect("/login");
  }

  return <>{children}</>;
}
