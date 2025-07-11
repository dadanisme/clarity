"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { PageLoading } from "@/components/ui/loading";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/signin",
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        router.push("/transactions");
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  if (loading) {
    return <PageLoading text="Authenticating..." />;
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
