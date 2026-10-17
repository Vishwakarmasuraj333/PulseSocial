"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DraftsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/posts?filter=DRAFT");
  }, [router]);
  return null;
}
