"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard for development
    router.push("/dashboard");
  }, [router]);

  return null;
}
