import { Address } from "@graphprotocol/graph-ts";
import { TokenComplianceModuleConfig } from "../../../generated/schema";
import { fetchComplianceModule } from "../../compliance/fetch/compliance-module";
import { fetchComplianceModuleParameters } from "../../compliance/fetch/compliance-module-parameters";
import { fetchToken } from "./token";

export function fetchTokenComplianceModuleConfig(
  tokenAddress: Address,
  complianceModuleAddress: Address
): TokenComplianceModuleConfig {
  let complianceModuleConfigId = tokenAddress.concat(complianceModuleAddress);
  let tokenComplianceModule = TokenComplianceModuleConfig.load(
    complianceModuleConfigId
  );

  if (!tokenComplianceModule) {
    tokenComplianceModule = new TokenComplianceModuleConfig(
      complianceModuleConfigId
    );
    tokenComplianceModule.token = fetchToken(tokenAddress).id;
    tokenComplianceModule.complianceModule = fetchComplianceModule(
      complianceModuleAddress
    ).id;
    tokenComplianceModule.parameters = fetchComplianceModuleParameters(
      complianceModuleConfigId
    ).id;

    tokenComplianceModule.save();
  }

  return tokenComplianceModule;
}
