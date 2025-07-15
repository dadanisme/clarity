"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ProfileForm } from "./profile-form";
import { PWAInstallButton } from "./pwa-install-button";
import { LogOut, User, Mail, Calendar, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useUserFeatures } from "@/hooks/use-features";
import { FEATURE_METADATA } from "@/lib/firebase/feature-service";
import { FeatureSubscription } from "@/types";
import { formatDate } from "@/lib/utils/date-utils";

export function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: userFeatures = [] } = useUserFeatures();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{user?.displayName}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            {user?.createdAt && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <ProfileForm />
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={mounted ? theme : "system"}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Install App</Label>
            <PWAInstallButton />
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>My Features</span>
          </CardTitle>
          <CardDescription>Features available to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturesDisplay userFeatures={userFeatures} />
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Sign Out</CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeaturesDisplayProps {
  userFeatures: FeatureSubscription[];
}

function FeaturesDisplay({ userFeatures }: FeaturesDisplayProps) {
  const activeFeatures = userFeatures.filter((f) => f.status === "active");
  const activeFeatureIds = new Set(activeFeatures.map((f) => f.id));

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {activeFeatures.length > 0
          ? `You have access to ${activeFeatures.length} of ${
              Object.keys(FEATURE_METADATA).length
            } available features:`
          : `${
              Object.keys(FEATURE_METADATA).length
            } features available (none enabled):`}
      </div>
      <div className="grid gap-3">
        {Object.entries(FEATURE_METADATA).map(([featureId, metadata]) => {
          const userFeature = activeFeatures.find((f) => f.id === featureId);
          const isActive = activeFeatureIds.has(featureId);

          return (
            <div
              key={featureId}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                isActive ? "bg-accent" : "bg-muted/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center space-x-2 font-medium text-sm ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isActive ? "bg-success" : "bg-destructive"
                    }`}
                  />
                  <span>{metadata.name}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {metadata.description}
                </div>
                {isActive && userFeature?.grantedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Granted on {formatDate(userFeature.grantedAt)}
                  </div>
                )}
                {!isActive && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Contact an administrator to enable this feature
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
