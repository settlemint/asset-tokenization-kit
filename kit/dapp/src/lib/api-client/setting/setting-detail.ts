import type { SettingKey } from "@/lib/db/schema-settings";
import type { Setting } from "@/lib/queries/setting/setting-schema";

/**
 * Get a setting by key
 * @param key - The key of the setting to get
 * @returns The setting
 */
export async function settingDetail(key: SettingKey) {
  const response = await fetch(`/api/setting/${encodeURIComponent(key)}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return (await response.json()) as Setting;
}
