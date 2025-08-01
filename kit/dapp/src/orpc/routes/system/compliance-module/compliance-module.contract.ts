import { baseContract } from "@/orpc/procedures/base.contract";
import { SystemComplianceModuleCreateSchema } from "@/orpc/routes/system/compliance-module/routes/compliance-module.create.schema";
import { ComplianceModulesListOutputSchema } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list.schema";
import { SystemReadSchema } from "@/orpc/routes/system/routes/system.read.schema";

const complianceModuleCreate = baseContract
  .route({
    method: "POST",
    path: "/systems/compliance-modules",
    description: "Register system compliance modules",
    successDescription: "System compliance modules registered successfully",
    tags: ["system"],
  })
  .input(SystemComplianceModuleCreateSchema)
  .output(SystemReadSchema);

const complianceModuleList = baseContract
  .route({
    method: "GET",
    path: "/system/compliance-modules",
    description: "List all compliance modules registered in the system",
    successDescription: "Compliance modules retrieved successfully",
    tags: ["system", "compliance-module"],
  })
  .output(ComplianceModulesListOutputSchema);

export const complianceModuleContract = {
  complianceModuleCreate,
  complianceModuleList,
};
