"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MentionsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inbox?tab=mentions");
  }, [router]);
  return null;
}
