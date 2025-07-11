import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/firebase/services";
import type { CategoryFormData } from "@/lib/validations";

export function useCategories(userId: string) {
  return useQuery({
    queryKey: ["categories", userId],
    queryFn: () => getCategories(userId),
    enabled: !!userId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CategoryFormData;
    }) => createCategory(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      categoryId,
      data,
    }: {
      userId: string;
      categoryId: string;
      data: Partial<CategoryFormData>;
    }) => updateCategory(userId, categoryId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      categoryId,
    }: {
      userId: string;
      categoryId: string;
    }) => deleteCategory(userId, categoryId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
}
