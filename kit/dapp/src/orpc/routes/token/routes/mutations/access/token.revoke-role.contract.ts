import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenRevokeRoleInputSchema,
  TokenRevokeRoleOutputSchema,
} from "@/orpc/routes/token/routes/mutations/access/token.revoke-role.schema";

const TAGS = ["token"];

export const tokenRevokeRoleContract = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/revoke-role",
    description: "Revoke role(s) from account(s) on a token",
    successDescription:
      "Roles revoked successfully from the specified accounts. Returns updated details.",
    tags: TAGS,
  })
  .input(TokenRevokeRoleInputSchema)
  .output(TokenRevokeRoleOutputSchema);
