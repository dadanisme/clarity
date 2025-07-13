import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { FeatureService } from "@/lib/firebase/feature-service";
import { FeatureFlag, UserRole } from "@/types";

// Hook to check if current user has a specific feature
export function useFeatureAccess(feature: FeatureFlag) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["feature-access", user?.id, feature],
    queryFn: () => {
      if (!user?.id) return false;
      return FeatureService.hasFeature(user.id, feature);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get all features for current user
export function useUserFeatures() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-features", user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return FeatureService.getUserFeatures(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to grant feature (admin only)
export function useGrantFeature() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      userId,
      feature,
      featureName,
      notes,
    }: {
      userId: string;
      feature: FeatureFlag;
      featureName: string;
      notes?: string;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }
      
      return FeatureService.grantFeature(userId, feature, user.id, featureName, notes);
    },
    onSuccess: (_, variables) => {
      // Invalidate feature queries for the affected user
      queryClient.invalidateQueries({
        queryKey: ["feature-access", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-features", variables.userId],
      });
    },
  });
}

// Hook to revoke feature (admin only)
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
    onSuccess: (_, variables) => {
      // Invalidate feature queries for the affected user
      queryClient.invalidateQueries({
        queryKey: ["feature-access", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-features", variables.userId],
      });
    },
  });
}

// Hook to delete feature (admin only)
export function useDeleteFeature() {
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
      
      return FeatureService.deleteFeature(userId, feature);
    },
    onSuccess: (_, variables) => {
      // Invalidate feature queries for the affected user
      queryClient.invalidateQueries({
        queryKey: ["feature-access", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-features", variables.userId],
      });
    },
  });
}

// Utility hook to check if current user is admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
}

// Higher-order component for feature gating
export function useFeatureGate(feature: FeatureFlag) {
  const { data: hasAccess, isLoading } = useFeatureAccess(feature);
  
  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    isBlocked: !isLoading && !hasAccess,
  };
}