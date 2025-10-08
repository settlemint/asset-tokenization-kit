import { apiKeyCreate } from "@/orpc/routes/system/api-keys/routes/api-key.create";
import { apiKeyList } from "@/orpc/routes/system/api-keys/routes/api-key.list";
import { apiKeyRevoke } from "@/orpc/routes/system/api-keys/routes/api-key.revoke";

const routes = {
  list: apiKeyList,
  create: apiKeyCreate,
  revoke: apiKeyRevoke,
};

export default routes;
