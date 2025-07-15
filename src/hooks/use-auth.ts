import { useAuthStore } from '@/lib/stores/auth-store';

export const useAuth = () => {
  return useAuthStore();
};