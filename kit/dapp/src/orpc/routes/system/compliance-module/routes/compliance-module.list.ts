import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
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

export const complianceModuleList = portalRouter.system.compliance.list
  .use(systemMiddleware)
  .handler(async ({ context, errors }): Promise<ComplianceModulesList> => {
    const { system } = context;

    const registryAddress = system?.complianceModuleRegistry;
    if (!registryAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System compliance module registry not found",
      });
    }

    const { complianceModules } = await theGraphClient.request({
      document: COMPLIANCE_MODULES_QUERY,
      variables: {
        registryAddress,
      },
    });

    return ComplianceModulesListOutputSchema.parse(complianceModules);
  });
