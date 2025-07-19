"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <WifiOff className="w-16 h-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
          <p className="text-muted-foreground max-w-md">
            It looks like you&apos;ve lost your internet connection. Some
            features may not be available while offline.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <p className="text-sm text-muted-foreground">
            Check your internet connection and try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}
