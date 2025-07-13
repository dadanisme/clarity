"use client";

import { ReactNode } from "react";
import { useFeatureGate } from "@/hooks/use-features";
import { FeatureFlag } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { FEATURE_METADATA } from "@/lib/firebase/feature-service";

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
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const metadata = FEATURE_METADATA[feature];

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{metadata.name} Required</CardTitle>
        <CardDescription>{metadata.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          This feature is not available in your current plan. Contact an administrator to enable this feature.
        </p>
        <Button variant="outline" disabled>
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
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}