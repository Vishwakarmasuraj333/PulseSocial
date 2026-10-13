"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScheduledRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/posts?filter=SCHEDULED");
  }, [router]);
  return null;
}
