"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Info, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Device and browser detection utilities
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isSafari = () => {
  if (typeof window === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
};

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isSafari: false,
    isStandalone: false,
  });

  useEffect(() => {
    // Set device info
    setDeviceInfo({
      isIOS: isIOS(),
      isSafari: isSafari(),
      isStandalone: isStandalone(),
    });

    // Check if app is already installed
    if (isStandalone()) {
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

  // Show installed status
  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Check className="w-4 h-4" />
        <span>App is installed</span>
      </div>
    );
  }

  // iOS Safari - show manual installation instructions
  if (deviceInfo.isIOS && deviceInfo.isSafari) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="w-4 h-4" />
          <span>Install on iOS</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <span>1. Tap</span>
            <Share className="w-3 h-3" />
            <span>Share button below</span>
          </div>
          <div>2. Select &quot;Add to Home Screen&quot;</div>
        </div>
      </div>
    );
  }

  // Browsers with beforeinstallprompt support
  if (deferredPrompt) {
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

  // Unsupported browsers
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>Manual installation required</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Use your browser&apos;s menu to install this app
      </div>
    </div>
  );
}
