"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inbox?tab=comments");
  }, [router]);
  return null;
}
