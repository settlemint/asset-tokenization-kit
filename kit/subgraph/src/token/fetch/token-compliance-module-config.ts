import { Address } from "@graphprotocol/graph-ts";
import { TokenComplianceModuleConfig } from "../../../generated/schema";
import { fetchComplianceModule } from "../../compliance/fetch/compliance-module";
import { fetchComplianceModuleParameters } from "../../compliance/fetch/compliance-module-parameters";
import { getTokenSystemAddress } from "../utils/token-utils";
import { fetchToken } from "./token";

export function fetchTokenComplianceModuleConfig(
  tokenAddress: Address,
  complianceModuleAddress: Address
): TokenComplianceModuleConfig {
  const complianceModuleConfigId = tokenAddress.concat(complianceModuleAddress);
  let tokenComplianceModule = TokenComplianceModuleConfig.load(
    complianceModuleConfigId
  );

  if (!tokenComplianceModule) {
    tokenComplianceModule = new TokenComplianceModuleConfig(
      complianceModuleConfigId
    );
    const token = fetchToken(tokenAddress);
    tokenComplianceModule.token = token.id;
    const systemAddress = getTokenSystemAddress(token);
    tokenComplianceModule.complianceModule = fetchComplianceModule(
      systemAddress,
      complianceModuleAddress
    ).id;
    tokenComplianceModule.parameters = fetchComplianceModuleParameters(
      complianceModuleConfigId
    ).id;

    tokenComplianceModule.save();
  }

  return tokenComplianceModule;
}
