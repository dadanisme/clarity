import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSettings } from "@/lib/firebase/services";
import type { User } from "@/types";

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      settings,
    }: {
      userId: string;
      settings: User["settings"];
    }) => updateUserSettings(userId, settings),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}
