import { grantRole } from "@/orpc/routes/system/access-manager/routes/grant-role";
import { revokeRole } from "@/orpc/routes/system/access-manager/routes/revoke-role";
import { rolesList } from "@/orpc/routes/system/access-manager/routes/roles.list";

const routes = {
  grantRole,
  revokeRole,
  rolesList,
};

export default routes;
