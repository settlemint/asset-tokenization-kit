"use client";

import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/db/schema-settings";
import { getSetting } from "@/lib/queries/setting/setting-detail";
import { useEffect, useState } from "react";

type Settings = typeof DEFAULT_SETTINGS;

export function useSettings(key: SettingKey): Settings[SettingKey] {
  const [value, setValue] = useState<Settings[SettingKey]>(
    DEFAULT_SETTINGS[key]
  );

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const settingValue = await getSetting({ key });
        setValue(
          (settingValue?.value as Settings[SettingKey]) ?? DEFAULT_SETTINGS[key]
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
