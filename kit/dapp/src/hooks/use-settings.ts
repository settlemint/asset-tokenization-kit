"use client";

import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { useEffect, useState } from "react";

type Settings = typeof DEFAULT_SETTINGS;

const GetSetting = hasuraGraphql(`
  query GetSetting($_eq: String = "") {
    settings(where: {key: {_eq: $_eq}}) {
      value
    }
  }
`);

export function useSettings(key: SettingKey): Settings[SettingKey] {
  const [value, setValue] = useState<Settings[SettingKey]>(
    DEFAULT_SETTINGS[key]
  );

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const result = await hasuraClient.request(GetSetting, { _eq: key });
        const settingValue = result.settings[0]?.value as Settings[SettingKey];
        setValue(settingValue ?? DEFAULT_SETTINGS[key]);
      } catch (error) {
        console.error("Failed to load setting:", error);
        setValue(DEFAULT_SETTINGS[key]);
      }
    };

    void loadSetting();
  }, [key]);

  return value;
}
