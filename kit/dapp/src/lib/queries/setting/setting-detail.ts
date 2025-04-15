import "server-only";

import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { SettingSchema } from "./setting-schema";

const GetSetting = hasuraGraphql(`
  query GetSetting($_eq: String = "") {
    settings(where: {key: {_eq: $_eq}}) {
      key
      value
    }
  }
`);

/**
 * Fetches a setting by key
 *
 * @param key - The key of the setting to fetch
 * @returns The setting value
 */
export const getSettingValue = withTracing(
  "queries",
  "getSettingValue",
  cache(async ({ key }: { key: SettingKey }) => {
    "use cache";
    cacheTag("setting");
    const result = await hasuraClient.request(
      GetSetting,
      { _eq: key },
      {
        "X-GraphQL-Operation-Name": "GetSetting",
        "X-GraphQL-Operation-Type": "query",
      }
    );
    if (result.settings.length === 0) {
      return { value: DEFAULT_SETTINGS[key], key };
    }
    return safeParse(SettingSchema, result.settings[0]);
  })
);

/**
 * Fetches a setting by key
 *
 * @param key - The key of the setting to fetch
 * @returns The setting value
 */
export const getSetting = withAccessControl(
  {
    requiredPermissions: {
      setting: ["read"],
    },
  },
  getSettingValue
);
