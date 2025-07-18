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
      category_id,
      data,
    }: {
      category_id: string;
      data: Partial<CategoryFormData>;
    }) => CategoriesService.updateCategory(category_id, data),
    onSuccess: (_, { category_id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", category_id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category_id }: { category_id: string }) =>
      CategoriesService.deleteCategory(category_id),
    onSuccess: (_, { category_id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", category_id] });
    },
  });
}
