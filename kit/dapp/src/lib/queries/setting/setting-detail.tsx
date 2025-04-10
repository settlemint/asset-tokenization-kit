"use server";

import type { SettingKey } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { ApiError } from "next/dist/server/api-utils";
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
export const getSetting = withTracing(
  "queries",
  "getSetting",
  cache(
    withAccessControl(
      {
        requiredPermissions: {
          setting: ["read"],
        },
      },
      async ({ key }: { key: SettingKey }) => {
        const result = await hasuraClient.request(GetSetting, { _eq: key });
        if (result.settings.length === 0) {
          throw new ApiError(404, `Setting '${key}' not found`);
        }
        return safeParse(SettingSchema, result.settings[0]);
      }
    )
  )
);
