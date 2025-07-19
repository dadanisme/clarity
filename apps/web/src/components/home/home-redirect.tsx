"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { PageLoading } from "@/components/ui/loading";
import { PATHS } from "@/lib/paths";

export function HomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to transactions
        router.replace(PATHS.transactions);
      } else {
        // User is not authenticated, redirect to signin
        router.replace(PATHS.signin);
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  return <PageLoading text="Redirecting..." />;
}
