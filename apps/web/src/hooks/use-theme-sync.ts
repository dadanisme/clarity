"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUserSettings } from "./use-settings";
import { Theme } from "@/types";

export function useThemeSync() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const updateSettings = useUpdateUserSettings();

  useEffect(() => {
    if (user?.id && theme && theme !== user.theme) {
      updateSettings.mutate({
        userId: user.id,
        settings: {
          theme: theme as Theme,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, user?.id, user?.theme]);
}
