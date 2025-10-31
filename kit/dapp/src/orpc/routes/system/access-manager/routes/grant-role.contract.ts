import { baseContract } from "@/orpc/procedures/base.contract";
import {
  GrantRoleInputSchema,
  GrantRoleOutputSchema,
} from "./grant-role.schema";

const TAGS = ["access-manager"];

export const grantRoleContract = baseContract
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
