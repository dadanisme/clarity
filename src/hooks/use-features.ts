import { useAuth } from "@/hooks/use-auth";
import { FeatureFlag, UserRole, FeatureSubscription } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/types";
import { FeatureService } from "@/lib/firebase/feature-service";
import { useEffect, useRef } from "react";
import { updateUserRole } from "@/lib/firebase/services";

// React Query hook with real-time updates for feature access
export function useFeatureAccess(feature: FeatureFlag) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const query = useQuery({
    queryKey: ["feature-access", user?.id, feature],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;

      // Get initial value
      const hasAccess = await FeatureService.hasFeature(user.id, feature);

      // Set up real-time listener for subsequent updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = FeatureService.subscribeToFeature(
        user.id,
        feature,
        (access) => {
          // Update React Query cache with real-time data
          queryClient.setQueryData(
            ["feature-access", user.id, feature],
            access
          );
        }
      );

      return hasAccess;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });

  // Cleanup listener on unmount or user change
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, feature]);

  return query;
}

// React Query hook with real-time updates for all user features
export function useUserFeatures() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const query = useQuery({
    queryKey: ["user-features", user?.id],
    queryFn: async (): Promise<FeatureSubscription[]> => {
      if (!user?.id) return [];

      // Get initial value
      const features = await FeatureService.getUserFeatures(user.id);

      // Set up real-time listener for subsequent updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = FeatureService.subscribeToUserFeatures(
        user.id,
        (userFeatures) => {
          // Update React Query cache with real-time data
          queryClient.setQueryData(["user-features", user.id], userFeatures);
        }
      );

      return features;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });

  // Cleanup listener on unmount or user change
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id]);

  return query;
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

// Hook to get all users (admin only) - keeping TanStack Query for complex admin queries
export function useAdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as User[];
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Admin feature management hooks using service directly
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

      return FeatureService.grantFeature(
        userId,
        feature,
        user.id,
        featureName,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// Hook to update user role (admin only)
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }

      return updateUserRole(userId, role, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// Utility hook to check if current user is admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
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
      return FeatureService.getUserFeatures(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 1000, // Very short cache since this is for admin management
  });
}
