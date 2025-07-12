"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsLoading(true);

    try {
      // Prevent default and prompt when user actually wants to install
      deferredPrompt.preventDefault();
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setIsInstalled(true);
      } else {
        console.log("User dismissed the install prompt");
      }
    } catch (error) {
      console.error("Error during PWA installation:", error);
    } finally {
      setIsLoading(false);
      setDeferredPrompt(null);
    }
  };

  // Don't show button if app is already installed
  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Check className="w-4 h-4" />
        <span>App is installed</span>
      </div>
    );
  }

  // Don't show button if PWA is not available
  if (!deferredPrompt) {
    return (
      <div className="text-sm text-muted-foreground">
        Install not available on this device
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstallClick}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      <Download className="w-4 h-4 mr-2" />
      {isLoading ? "Installing..." : "Install App"}
    </Button>
  );
}
