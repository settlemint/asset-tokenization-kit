import { baseContract } from "@/orpc/procedures/base.contract";
import { SystemComplianceModuleCreateSchema } from "@/orpc/routes/system/compliance-module/routes/complianceModule.create.schema";
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

export const complianceModuleContract = {
  complianceModuleCreate,
};
