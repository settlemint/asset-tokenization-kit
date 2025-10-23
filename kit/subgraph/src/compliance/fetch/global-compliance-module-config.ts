import { Address } from "@graphprotocol/graph-ts";
import { GlobalComplianceModuleConfig } from "../../../generated/schema";
import { fetchCompliance } from "./compliance";
import { fetchComplianceModule } from "./compliance-module";
import { fetchComplianceModuleParameters } from "./compliance-module-parameters";

export function fetchGlobalComplianceModuleConfig(
  complianceAddress: Address,
  complianceModuleAddress: Address
): GlobalComplianceModuleConfig {
  const complianceModuleConfigId = complianceAddress.concat(
    complianceModuleAddress
  );
  let globalComplianceModule = GlobalComplianceModuleConfig.load(
    complianceModuleConfigId
  );

  if (!globalComplianceModule) {
    globalComplianceModule = new GlobalComplianceModuleConfig(
      complianceModuleConfigId
    );
    const compliance = fetchCompliance(complianceAddress);
    globalComplianceModule.compliance = compliance.id;
    globalComplianceModule.complianceModule = fetchComplianceModule(
      Address.fromBytes(compliance.system),
      complianceModuleAddress
    ).id;
    globalComplianceModule.parameters = fetchComplianceModuleParameters(
      complianceModuleConfigId
    ).id;

    globalComplianceModule.save();
  }

  return globalComplianceModule;
}
