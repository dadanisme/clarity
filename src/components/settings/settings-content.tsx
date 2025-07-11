"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/providers/auth-provider";
import { useUpdateUserSettings } from "@/hooks/use-settings";
import { useState } from "react";

export function SettingsContent() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(user?.settings?.theme || "system");
  const updateSettings = useUpdateUserSettings();

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (user?.id) {
      await updateSettings.mutateAsync({
        userId: user.id,
        settings: { theme: newTheme },
      });
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8"></div>

      {/* Account Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <p className="text-sm text-gray-600 mt-1">{user?.displayName}</p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>
          <div>
            <Label htmlFor="memberSince">Member Since</Label>
            <p className="text-sm text-gray-600 mt-1">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose your preferred color theme
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
