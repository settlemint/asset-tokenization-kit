import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import * as z from "zod";
import {
  ComplianceModulesListOutputSchema,
  type ComplianceModulesList,
} from "./compliance-module.list.schema";

const COMPLIANCE_MODULES_QUERY = theGraphGraphql(
  `
  query GetComplianceModules($registryAddress: String!) {
    complianceModules(where: {complianceModuleRegistry: $registryAddress}) @fetchAll {
      id
      module
      typeId
      name
      globalConfigs {
        id
        parameters {
          addresses
          countries
        }
      }
    }
  }
`,
  []
);

export const complianceModuleList = systemRouter.system.compliance.list.handler(
  async ({ context }): Promise<ComplianceModulesList> => {
    const { system } = context;

    const registryAddress = system.complianceModuleRegistry.id;

    const { complianceModules } = await context.theGraphClient.query(
      COMPLIANCE_MODULES_QUERY,
      {
        input: { registryAddress },
        output: z.object({
          complianceModules: ComplianceModulesListOutputSchema,
        }),
      }
    );

    return ComplianceModulesListOutputSchema.parse(complianceModules);
  }
);
