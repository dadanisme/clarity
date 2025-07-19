import { useAuth } from "@/hooks/use-auth";
import { FeatureFlag, UserRole, FeatureSubscription } from "@clarity/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FeatureService } from "@clarity/shared/services";

// React Query hook with real-time updates for feature access
export function useFeatureAccess(feature: FeatureFlag) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["feature-access", user?.id, feature],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      return FeatureService.hasFeature(user.id, feature);
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });
}

// React Query hook with real-time updates for all user features
export function useUserFeatures() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-features", user?.id],
    queryFn: async (): Promise<FeatureSubscription[]> => {
      if (!user?.id) return [];
      return FeatureService.getUserFeatures(user.id);
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });
}

// React Query-based feature gate hook
export function useFeatureGate(feature: FeatureFlag) {
  const { data: hasAccess, isLoading, error } = useFeatureAccess(feature);

  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    isBlocked: !isLoading && !hasAccess,
    error,
  };
}

// Admin feature management hooks using service directly
export function useGrantFeature() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      feature,
      feature_name,
      notes,
    }: {
      userId: string;
      feature: FeatureFlag;
      feature_name: string;
      notes?: string;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }

      return FeatureService.grantFeature(
        userId,
        feature,
        user.id,
        feature_name,
        notes
      );
    },
    onSuccess: () => {
      // Invalidate admin users to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useRevokeFeature() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      feature,
    }: {
      userId: string;
      feature: FeatureFlag;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }

      return FeatureService.revokeFeature(userId, feature, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// For backwards compatibility - features that aren't converted yet
export function useUserFeaturesById(userId: string) {
  return useQuery({
    queryKey: ["user-features", userId],
    queryFn: async () => {
      if (!userId) return [];
      return FeatureService.getUserFeatures(userId);
    },
    enabled: !!userId,
    staleTime: 1000, // Very short cache since this is for admin viewing
  });
}

export function useManageUserFeatures(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["manage-user-features", userId],
    queryFn: async () => {
      if (!userId) return [];
      return FeatureService.getAllUserFeatures(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 1000, // Very short cache since this is for admin management
  });
}
