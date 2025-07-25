import { baseContract } from "@/orpc/procedures/base.contract";
import {
  SystemComplianceModuleCreateOutputSchema,
  SystemComplianceModuleCreateSchema,
} from "@/orpc/routes/system/compliance-module/routes/complianceModule.create.schema";
import { eventIterator } from "@orpc/server";

const complianceModuleCreate = baseContract
  .route({
    method: "POST",
    path: "/systems/compliance-modules",
    description: "Register system compliance modules",
    successDescription: "System compliance modules registered successfully",
    tags: ["system"],
  })
  .input(SystemComplianceModuleCreateSchema)
  .output(eventIterator(SystemComplianceModuleCreateOutputSchema));

export const complianceModuleContract = {
  complianceModuleCreate,
};
