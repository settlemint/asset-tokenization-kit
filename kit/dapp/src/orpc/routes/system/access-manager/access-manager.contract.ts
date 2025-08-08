import { grantRoleContract } from "./routes/grant-role.contract";
import { revokeRoleContract } from "./routes/revoke-role.contract";
import { rolesListContract } from "./routes/roles.list.contract";

export const accessManagerContract = {
  grantRole: grantRoleContract,
  revokeRole: revokeRoleContract,
  rolesList: rolesListContract,
};
