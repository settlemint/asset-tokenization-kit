import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getVaultList } from "../queries/vault/vault-list";
import { VaultListSchema } from "../queries/vault/vault-schema";

export const VaultApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .get(
    "",
    async () => {
      return getVaultList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all vaults in the system with their details including total signers, required signers, pending transactions count, executed transactions count, and last activity.",
        tags: ["vault"],
      },
      response: {
        200: t.Array(VaultListSchema),
        ...defaultErrorSchema,
      },
    }
  );
