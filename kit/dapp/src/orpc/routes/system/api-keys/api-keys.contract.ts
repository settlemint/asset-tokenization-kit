import { baseContract } from "@/orpc/procedures/base.contract";
import {
  ApiKeyCreateInputSchema,
  ApiKeyRevokeInputSchema,
  ApiKeyRevokeResultSchema,
  ApiKeySchema,
  ApiKeyWithSecretSchema,
} from "@/orpc/routes/system/api-keys/routes/api-key.schemas";

const TAGS = ["system", "api-key"];

const list = baseContract
  .route({
    method: "GET",
    path: "/systems/api-keys",
    description:
      "List API keys configured for the platform, including impersonation details and usage metadata",
    successDescription:
      "Current API keys with impersonation targets and audit metadata",
    tags: TAGS,
  })
  .output(ApiKeySchema.array());

const create = baseContract
  .route({
    method: "POST",
    path: "/systems/api-keys",
    description:
      "Create a new API key that can optionally impersonate a specific user",
    successDescription:
      "API key created successfully. The secret is returned once and cannot be retrieved again.",
    tags: TAGS,
  })
  .input(ApiKeyCreateInputSchema)
  .output(ApiKeyWithSecretSchema);

const revoke = baseContract
  .route({
    method: "DELETE",
    path: "/systems/api-keys/:id",
    description: "Disable an API key, immediately revoking access",
    successDescription: "API key revoked",
    tags: TAGS,
  })
  .input(ApiKeyRevokeInputSchema)
  .output(ApiKeyRevokeResultSchema);

export const apiKeysContract = {
  list,
  create,
  revoke,
};
