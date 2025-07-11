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

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    onImageClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label>Receipt Image</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraCapture}
          disabled
          className="flex-1 relative"
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            Soon
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleClearImage}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
