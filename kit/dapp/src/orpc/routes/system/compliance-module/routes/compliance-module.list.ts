import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import z from "zod";
import {
  ComplianceModulesListOutputSchema,
  type ComplianceModulesList,
} from "./compliance-module.list.schema";

const COMPLIANCE_MODULES_QUERY = theGraphGraphql(
  `
  query GetComplianceModules($registryAddress: String!) {
    complianceModules(where: {complianceModuleRegistry: $registryAddress}) @fetchAll {
      id
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

export const complianceModuleList =
  systemRouter.system.complianceModuleList.handler(
    async ({ context, errors }): Promise<ComplianceModulesList> => {
      const { system } = context;

      const registryAddress = system?.complianceModuleRegistry;
      if (!registryAddress) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "System compliance module registry not found",
        });
      }

      const response = await context.theGraphClient.query(
        COMPLIANCE_MODULES_QUERY,
        {
          input: { registryAddress },
          output: z.object({
            complianceModules: ComplianceModulesListOutputSchema,
          }),
        }
      );

      return response.complianceModules;
    }
  );
