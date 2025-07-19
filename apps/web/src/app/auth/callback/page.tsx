"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { PATHS } from "@clarity/shared/utils";
import { supabase } from "@clarity/shared/services";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push(`${PATHS.signin}?error=auth_callback_error`);
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push(PATHS.overview);
        } else {
          // No session, redirect to signin
          router.push(PATHS.signin);
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        router.push(`${PATHS.signin}?error=unexpected_error`);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
