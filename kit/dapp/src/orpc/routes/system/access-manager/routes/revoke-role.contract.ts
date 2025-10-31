import { baseContract } from "@/orpc/procedures/base.contract";
import {
  RevokeRoleInputSchema,
  RevokeRoleOutputSchema,
} from "./revoke-role.schema";

const TAGS = ["access-manager"];

export const revokeRoleContract = baseContract
  .route({
    method: "DELETE",
    path: "/system/access-manager/revoke-roles",
    description: "Revoke a role from multiple accounts",
    successDescription:
      "Roles revoked successfully. Returns updated accounts details.",
    tags: TAGS,
  })
  .input(RevokeRoleInputSchema)
  .output(RevokeRoleOutputSchema);
