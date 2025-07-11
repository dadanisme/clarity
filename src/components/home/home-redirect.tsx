"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { PageLoading } from "@/components/ui/loading";

export function HomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to transactions
        router.replace("/transactions");
      } else {
        // User is not authenticated, redirect to signin
        router.replace("/signin");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  return <PageLoading text="Redirecting..." />;
}
