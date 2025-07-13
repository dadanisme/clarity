"use client";

import { Label } from "@/components/ui/label";
import { FeatureFlag } from "@/types";
import { FEATURE_METADATA } from "@/lib/firebase/feature-service";

interface FeatureSelectionProps {
  selectedFeatures: FeatureFlag[];
  onFeatureChange: (features: FeatureFlag[]) => void;
}

export function FeatureSelection({
  selectedFeatures,
  onFeatureChange,
}: FeatureSelectionProps) {
  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    const feature = featureId as FeatureFlag;
    if (checked) {
      onFeatureChange([...selectedFeatures, feature]);
    } else {
      onFeatureChange(selectedFeatures.filter((f) => f !== feature));
    }
  };

  return (
    <div className="space-y-3">
      <Label>Available Features</Label>
      {Object.entries(FEATURE_METADATA).map(([featureId, metadata]) => (
        <div
          key={featureId}
          className="flex items-start space-x-3 p-3 rounded-lg border"
        >
          <input
            type="checkbox"
            id={featureId}
            checked={selectedFeatures.includes(featureId as FeatureFlag)}
            onChange={(e) => handleFeatureToggle(featureId, e.target.checked)}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <div className="flex-1">
            <label htmlFor={featureId} className="cursor-pointer">
              <div className="font-medium text-sm">{metadata.name}</div>
              <div className="text-sm text-muted-foreground">
                {metadata.description}
              </div>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}