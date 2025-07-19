"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Home } from "lucide-react";
import { PATHS } from "@clarity/shared/utils";

interface DesktopOnlyProps {
  children: React.ReactNode;
}

export function DesktopOnly({ children }: DesktopOnlyProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    setMounted(true);

    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Monitor className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Desktop Required</h1>
            <p className="text-muted-foreground">
              Admin dashboard is only available on desktop devices
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">Mobile device detected</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Please access this page from a desktop or laptop computer for the
            best experience managing users and features.
          </p>

          <Button
            onClick={() => router.push(PATHS.overview)}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
