import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesService } from "@/lib/supabase";
import type { CategoryFormData } from "@/lib/validations";

export function useCategories(userId: string) {
  return useQuery({
    queryKey: ["categories", userId],
    queryFn: () => CategoriesService.getCategories(userId),
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
    }) => CategoriesService.createCategory(userId, data),
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
    }) => CategoriesService.updateCategory(categoryId, data),
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
    }) => CategoriesService.deleteCategory(categoryId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
}