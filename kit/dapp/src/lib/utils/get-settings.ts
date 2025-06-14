import { orpc } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/query/hydrate-client";
import type { SettingKey } from "./zod/validators/settings-key";

export const getSetting = async (key: SettingKey, required: boolean = true) => {
  try {
    const { value: settingValue } = await getQueryClient().fetchQuery(
      orpc.settings.read.queryOptions({
        input: {
          key,
        },
      })
    );
    return settingValue;
  } catch (error) {
    if (required) {
      throw error;
    }
    return undefined;
  }
};
