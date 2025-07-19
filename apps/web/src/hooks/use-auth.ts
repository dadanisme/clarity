import { useAuthStore } from "@clarity/shared/stores/auth-store";

export const useAuth = () => {
  return useAuthStore();
};
