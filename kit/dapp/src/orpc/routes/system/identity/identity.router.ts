import { identityCreate } from "@/orpc/routes/system/identity/routes/identity.create";
import { identityList } from "@/orpc/routes/system/identity/routes/identity.list";
import { identityRegister } from "@/orpc/routes/system/identity/routes/identity.register";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { identitySearch } from "@/orpc/routes/system/identity/routes/identity.search";
import { identityMe } from "@/orpc/routes/system/identity/routes/identity.me";
import claims from "@/orpc/routes/system/identity/claims/claims.router";

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
