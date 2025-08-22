import { addonCreate } from "@/orpc/routes/system/addon/routes/addon.create";
import { addonList } from "@/orpc/routes/system/addon/routes/addon.list";

const routes = {
  create: addonCreate,
  list: addonList,
};

export default routes;
