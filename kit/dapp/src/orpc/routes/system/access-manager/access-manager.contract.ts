import { baseContract } from "@/orpc/procedures/base.contract";
import {
  GrantRoleInputSchema,
  GrantRoleOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/grant-role.schema";
import {
  RevokeRoleInputSchema,
  RevokeRoleOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/revoke-role.schema";

const TAGS = ["system", "access-manager"];

const grantRole = baseContract
  .route({
    method: "POST",
    path: "/system/access-manager/grant-roles",
    description: "Grant a role to multiple accounts",
    successDescription:
      "Roles granted successfully. Returns updated accounts details.",
    tags: TAGS,
  })
  .input(GrantRoleInputSchema)
  .output(GrantRoleOutputSchema);

const revokeRole = baseContract
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

export const accessManagerContract = {
  grantRole,
  revokeRole,
};
