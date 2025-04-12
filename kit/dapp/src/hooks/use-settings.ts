"use client";

import { apiClient } from "@/lib/api/client";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/db/schema-settings";
import { useEffect, useState } from "react";

type Settings = typeof DEFAULT_SETTINGS;

export function useSettings(key: SettingKey): Settings[SettingKey] {
  const [value, setValue] = useState<Settings[SettingKey]>(
    DEFAULT_SETTINGS[key]
  );

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const { data } = await apiClient.api.setting({ key }).get();

        setValue(
          (data?.value as Settings[SettingKey]) ?? DEFAULT_SETTINGS[key]
        );
      } catch (error) {
        console.error("Failed to load setting:", error);
        setValue(DEFAULT_SETTINGS[key]);
      }
    };

    void loadSetting();
  }, [key]);

  return value;
}
