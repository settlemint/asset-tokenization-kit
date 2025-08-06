import { baseContract } from "@/orpc/procedures/base.contract";
import {
  GrantRoleInputSchema,
  GrantRoleOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/grant-role.schema";
import {
  RevokeRoleInputSchema,
  RevokeRoleOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/revoke-role.schema";
import {
  SystemRolesInputSchema,
  SystemRolesOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/roles.list.schema";

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

const rolesList = baseContract
  .route({
    method: "GET",
    path: "/system/access-manager/roles",
    description: "List all accounts and their roles",
    successDescription: "List of all accounts and their roles",
    tags: TAGS,
  })
  .input(SystemRolesInputSchema)
  .output(SystemRolesOutputSchema);

export const accessManagerContract = {
  grantRole,
  revokeRole,
  rolesList,
};
