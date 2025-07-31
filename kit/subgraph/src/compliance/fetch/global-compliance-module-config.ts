import { Address } from "@graphprotocol/graph-ts";
import { GlobalComplianceModuleConfig } from "../../../generated/schema";
import { fetchCompliance } from "./compliance";
import { fetchComplianceModule } from "./compliance-module";
import { fetchComplianceModuleParameters } from "./compliance-module-parameters";

export function fetchGlobalComplianceModuleConfig(
  compliance: Address,
  complianceModuleAddress: Address
): GlobalComplianceModuleConfig {
  let complianceModuleConfigId = compliance.concat(complianceModuleAddress);
  let globalComplianceModule = GlobalComplianceModuleConfig.load(
    complianceModuleConfigId
  );

  if (!globalComplianceModule) {
    globalComplianceModule = new GlobalComplianceModuleConfig(
      complianceModuleConfigId
    );
    globalComplianceModule.compliance = fetchCompliance(compliance).id;
    globalComplianceModule.complianceModule = fetchComplianceModule(
      complianceModuleAddress
    ).id;
    globalComplianceModule.parameters = fetchComplianceModuleParameters(
      complianceModuleConfigId
    ).id;

    globalComplianceModule.save();
  }

  return globalComplianceModule;
}
