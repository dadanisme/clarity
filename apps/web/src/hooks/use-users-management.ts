import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/lib/supabase";

// Hook to get all users (admin only)
export function useAdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UserService.getAllUsers(),
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

      return UserService.updateUserRole(userId, role, user.id);
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