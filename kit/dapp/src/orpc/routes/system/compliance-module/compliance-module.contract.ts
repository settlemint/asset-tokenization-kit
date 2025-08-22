import { baseContract } from "@/orpc/procedures/base.contract";
import { SystemComplianceModuleCreateSchema } from "@/orpc/routes/system/compliance-module/routes/compliance-module.create.schema";
import { ComplianceModulesListOutputSchema } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list.schema";
import { SystemReadSchema } from "@/orpc/routes/system/routes/system.read.schema";

const TAGS = ["system", "compliance-module"];

const complianceModuleCreate = baseContract
  .route({
    method: "POST",
    path: "/systems/compliance-module",
    description: "Register system compliance modules",
    successDescription: "System compliance modules registered successfully",
    tags: TAGS,
  })
  .input(SystemComplianceModuleCreateSchema)
  .output(SystemReadSchema);

const complianceModuleList = baseContract
  .route({
    method: "GET",
    path: "/system/compliance-module",
    description: "List all compliance modules registered in the system",
    successDescription: "Compliance modules retrieved successfully",
    tags: TAGS,
  })
  .output(ComplianceModulesListOutputSchema);

export const complianceModuleContract = {
  create: complianceModuleCreate,
  list: complianceModuleList,
};
