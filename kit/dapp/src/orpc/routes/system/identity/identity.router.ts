import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";

const routes = {
  create: identityCreate,
  register: identityRegister,
};

export default routes;
