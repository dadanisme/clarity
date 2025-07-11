"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/providers/auth-provider";
import { useUpdateUserSettings } from "./use-settings";

export function useThemeSync() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const updateSettings = useUpdateUserSettings();

  useEffect(() => {
    if (user?.id && theme && theme !== user.settings?.theme) {
      updateSettings.mutate({
        userId: user.id,
        settings: {
          ...user.settings,
          theme: theme as "light" | "dark" | "system",
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, user?.id, user?.settings?.theme, updateSettings]);
}
