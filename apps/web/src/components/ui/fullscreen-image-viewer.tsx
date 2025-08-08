"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FullscreenImageViewerProps {
  src: string;
  alt: string;
  trigger: React.ReactNode;
}

export function FullscreenImageViewer({
  src,
  alt,
  trigger,
}: FullscreenImageViewerProps) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {alt || "Fullscreen image view"}
        </DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <div className="absolute top-8 right-8 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-background/10 hover:bg-background/20 text-foreground border-border/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image container */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
