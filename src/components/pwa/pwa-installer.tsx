"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    console.log("PWAInstaller");

    const handler = (e: Event) => {
      // Store the event without preventing default immediately
      // This prevents the warning about preventDefault() without prompt()
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
      setIsExiting(false);
      setIsEntering(true);
      setTimeLeft(10);

      // Remove entering state after animation completes
      setTimeout(() => {
        setIsEntering(false);
      }, 300);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Progress indicator countdown and auto-dismiss
  useEffect(() => {
    if (!showInstallPrompt) return;

    const progressInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          // Start exit animation
          setIsExiting(true);
          // Auto-dismiss after animation completes
          setTimeout(() => {
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [showInstallPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Start exit animation
    setIsExiting(true);

    // Prevent default and prompt when user actually wants to install
    deferredPrompt.preventDefault();
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Auto-dismiss after animation completes
    setTimeout(() => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }, 300);
  };

  if (!showInstallPrompt) return null;

  const progress = (timeLeft / 10) * 100;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 bg-card border rounded-lg p-4 shadow-lg max-w-sm mx-auto sm:max-w-none transition-all duration-300 ease-out ${
        isExiting
          ? "opacity-0 translate-y-2 pointer-events-none"
          : isEntering
          ? "opacity-0 translate-y-4"
          : "opacity-100 translate-y-0"
      }`}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted/20 rounded-t-lg overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start space-x-3">
        <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base">
                Install Clarity
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Add to your home screen for quick access
              </p>
            </div>
            <Button
              onClick={handleInstallClick}
              size="default"
              className="text-sm px-4 py-2 h-10 flex-shrink-0"
            >
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
