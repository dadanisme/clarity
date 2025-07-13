"use client";

import { Badge } from "@/components/ui/badge";
import { useUserFeaturesById } from "@/hooks/use-features";

interface UserFeaturesProps {
  userId: string;
}

export function UserFeatures({ userId }: UserFeaturesProps) {
  const { data: userFeatures = [] } = useUserFeaturesById(userId);

  const activeFeatures = userFeatures.filter((f) => f.status === "active");

  if (activeFeatures.length === 0) {
    return <span className="text-sm text-muted-foreground">No features</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeFeatures.slice(0, 2).map((feature) => (
        <Badge key={feature.id} variant="outline" className="text-xs">
          {feature.featureName}
        </Badge>
      ))}
      {activeFeatures.length > 2 && (
        <Badge variant="outline" className="text-xs">
          +{activeFeatures.length - 2} more
        </Badge>
      )}
    </div>
  );
}