import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { CategoryFormData } from "@clarity/shared/validations";
import { CategoriesService } from "@clarity/shared/services";

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
    onSuccess: ({ user_id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", user_id] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category_id,
      data,
    }: {
      category_id: string;
      data: Partial<CategoryFormData>;
    }) => CategoriesService.updateCategory(category_id, data),
    onSuccess: ({ user_id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", user_id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category_id }: { category_id: string }) =>
      CategoriesService.deleteCategory(category_id),
    onSuccess: ({ user_id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", user_id] });
    },
  });
}
