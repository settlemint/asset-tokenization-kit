import { grantRole } from "../../system/access-manager/routes/grant-role";
import { revokeRole } from "../../system/access-manager/routes/revoke-role";
import { rolesList } from "../../system/access-manager/routes/roles.list";

const routes = {
  grantRole,
  revokeRole,
  rolesList,
};

export default routes;
