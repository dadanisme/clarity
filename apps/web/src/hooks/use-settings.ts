import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@clarity/shared/services";
import type { User } from "@clarity/types";

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      settings,
    }: {
      userId: string;
      settings: { theme: User["theme"] };
    }) => UserService.updateUser(userId, settings),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}
