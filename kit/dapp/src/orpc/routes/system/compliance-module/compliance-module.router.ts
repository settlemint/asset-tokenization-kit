import { complianceModuleCreate } from "@/orpc/routes/system/compliance-module/routes/compliance-module.create";
import { complianceModuleList } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list";

const routes = {
  create: complianceModuleCreate,
  list: complianceModuleList,
};

export default routes;
