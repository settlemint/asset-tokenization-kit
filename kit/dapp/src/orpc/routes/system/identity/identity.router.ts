import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";
import claims from "@/orpc/routes/system/identity/claims/claims.router";

const routes = {
  create: identityCreate,
  register: identityRegister,
  claims,
};

export default routes;
