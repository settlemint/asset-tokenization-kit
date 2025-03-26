"use client";

import { settingDetail } from "@/lib/api-client/setting/setting-detail";
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
        const settingValue = await settingDetail(key);
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
