import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.id) {
    redirect("/login?redirectTo=/onboarding/socials");
  }

  return <>{children}</>;
}
