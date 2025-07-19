"use client";

import { ReactNode } from "react";
import { useFeatureGate } from "@/hooks/use-features";
import { FeatureFlag } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { FEATURE_METADATA } from "@/lib/supabase/feature-service";

interface FeatureGateProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureGate(feature);

  if (isLoading) {
    return null;
  }

  if (hasAccess) {
    return (
      <div className="animate-in fade-in-0 zoom-in-95 duration-700 ease-out">
        {children}
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const metadata = FEATURE_METADATA[feature];

  return (
    <Card className="border-dashed animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted animate-in zoom-in-50 spin-in-180 duration-600 delay-200 ease-out">
          <Lock className="h-6 w-6 text-muted-foreground animate-in fade-in-0 zoom-in-75 duration-400 delay-500" />
        </div>
        <CardTitle className="text-lg animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-300 ease-out">{metadata.name} Required</CardTitle>
        <CardDescription className="animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-400 ease-out">{metadata.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-sm text-muted-foreground animate-in fade-in-0 zoom-in-95 duration-400 delay-500 ease-out">
          This feature is not available in your current plan. Contact an administrator to enable this feature.
        </p>
        <Button variant="outline" disabled className="animate-in fade-in-0 slide-in-from-bottom-4 zoom-in-95 duration-500 delay-600 ease-out hover:scale-105 transition-transform">
          Feature Locked
        </Button>
      </CardContent>
    </Card>
  );
}

// Simplified inline feature gate for smaller UI elements
interface InlineFeatureGateProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function InlineFeatureGate({
  feature,
  children,
  fallback = null,
}: InlineFeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureGate(feature);

  if (isLoading) {
    return null;
  }

  if (hasAccess) {
    return (
      <div className="animate-in fade-in-0 zoom-in-95 duration-500 ease-out">
        {children}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-400 ease-out">
      {fallback}
    </div>
  );
}