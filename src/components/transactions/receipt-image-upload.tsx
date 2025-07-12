"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ReceiptImageUploadProps {
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
}

export function ReceiptImageUpload({
  imagePreview,
  onImageSelect,
  onImageClear,
}: ReceiptImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    onImageSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };


  const handleClearImage = () => {
    onImageClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileClear = () => {
    handleClearImage();
  };

  return (
    <div className="space-y-4">
      <Label>Receipt Image</Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50">
        {imagePreview ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">Receipt image selected</p>
                <p className="text-sm text-muted-foreground">
                  Image ready for processing
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileClear}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, and other image formats
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {imagePreview && (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Receipt preview"
            className="w-full max-h-64 object-contain rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
