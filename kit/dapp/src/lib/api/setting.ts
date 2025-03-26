import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import {
  SettingKeySchema,
  SettingSchema,
} from "@/lib/queries/setting/setting-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import Elysia from "elysia";
import { getSetting } from "../queries/setting/setting-detail";

export const SettingApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .use(superJson)
  .get(
    "/:key",
    async ({ params: { key }, user }) => {
      return await getSetting({ key, ctx: { user } });
    },
    {
      auth: true,
      detail: {
        summary: "Details by key",
        description: "Retrieves a setting by key",
        tags: ["setting"],
      },
      params: t.Object({
        key: SettingKeySchema,
      }),
      response: {
        200: SettingSchema,
        ...defaultErrorSchema,
      },
    }
  );
