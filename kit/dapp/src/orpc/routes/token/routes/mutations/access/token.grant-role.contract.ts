import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenGrantRoleInputSchema,
  TokenGrantRoleOutputSchema,
} from "@/orpc/routes/token/routes/mutations/access/token.grant-role.schema";

const TAGS = ["token"];

export const tokenGrantRoleContract = baseContract
  .route({
    method: "POST",
    path: "/token/grant-role",
    description: "Grant a role to multiple accounts on a token",
    successDescription:
      "Role granted successfully to accounts. Returns updated accounts details.",
    tags: TAGS,
  })
  .input(TokenGrantRoleInputSchema)
  .output(TokenGrantRoleOutputSchema);
