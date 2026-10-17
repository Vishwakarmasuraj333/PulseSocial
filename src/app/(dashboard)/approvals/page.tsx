"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApprovalsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/posts?filter=PENDING_APPROVAL");
  }, [router]);
  return null;
}
