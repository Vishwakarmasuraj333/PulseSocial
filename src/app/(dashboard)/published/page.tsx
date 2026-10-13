"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublishedRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/posts?filter=PUBLISHED");
  }, [router]);
  return null;
}
