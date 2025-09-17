import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { identityMe } from "@/orpc/routes/system/identity/routes/identity.me";
import claims from "@/orpc/routes/system/identity/claims/claims.router";

const routes = {
  create: identityCreate,
  register: identityRegister,
  read: identityRead,
  me: identityMe,
  claims,
};

export default routes;
