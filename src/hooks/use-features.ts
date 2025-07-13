import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { FeatureService } from "@/lib/firebase/feature-service";
import { updateUserRole } from "@/lib/firebase/services";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FeatureFlag, UserRole, User } from "@/types";

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

// Hook to get all features for a specific user (admin use)
export function useUserFeaturesById(userId: string) {
  return useQuery({
    queryKey: ["user-features", userId],
    queryFn: () => {
      if (!userId) return [];
      return FeatureService.getUserFeatures(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get user features for management dialog (with different cache key)
export function useManageUserFeatures(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["manage-user-features", userId],
    queryFn: () => {
      if (!userId) return [];
      return FeatureService.getUserFeatures(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get all users (admin only)
export function useAdminUsers() {
  const isAdmin = useIsAdmin();
  
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
      // Invalidate all admin user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
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