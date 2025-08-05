import { grantRole } from "@/orpc/routes/system/access-manager/routes/grant-role";
import { revokeRole } from "@/orpc/routes/system/access-manager/routes/revoke-role";

const routes = {
  grantRole,
  revokeRole,
};

export default routes;
