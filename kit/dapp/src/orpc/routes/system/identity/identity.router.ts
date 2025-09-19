import claims from "@/orpc/routes/system/identity/claims/claims.router";
import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityList } from "@/orpc/routes/system/identity/routes/identity.list";
import { identityMe } from "@/orpc/routes/system/identity/routes/identity.me";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";
import { identitySearch } from "@/orpc/routes/system/identity/routes/identity.search";

const routes = {
  create: identityCreate,
  list: identityList,
  register: identityRegister,
  read: identityRead,
  search: identitySearch,
  me: identityMe,
  claims,
};

export default routes;
