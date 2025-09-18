import claims from "@/orpc/routes/system/identity/claims/claims.router";
import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityList } from "@/orpc/routes/system/identity/routes/identity.list";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";

const routes = {
  create: identityCreate,
  list: identityList,
  register: identityRegister,
  claims,
  read: identityRead,
};

export default routes;
