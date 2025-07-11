"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/providers/auth-provider";
import { ImageUpload } from "@/components/ui/image-upload";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, updateProfile, uploadProfileImage, removeProfileImage } =
    useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true);
      setMessage(null);

      await updateProfile({ displayName: data.displayName });

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsUploading(true);
      setMessage(null);

      await uploadProfileImage(file);

      setMessage({
        type: "success",
        text: "Profile image uploaded successfully!",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      setMessage(null);

      await removeProfileImage();

      setMessage({
        type: "success",
        text: "Profile image removed successfully!",
      });
    } catch (error) {
      console.error("Image removal error:", error);
      setMessage({
        type: "error",
        text: "Failed to remove image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Image Section */}
      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <ImageUpload
          currentImageUrl={user?.profileImage}
          displayName={user?.displayName || "User"}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          isUploading={isUploading}
          disabled={isUpdating}
        />
      </div>

      {/* Display Name Section */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          placeholder="Enter your display name"
          {...register("displayName")}
        />
        {errors.displayName && (
          <p className="text-sm text-destructive">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {/* Email Section (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user?.email || ""}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Email cannot be changed. Contact support if you need to update your
          email.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isUpdating || isUploading}>
        {isUpdating ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
}
