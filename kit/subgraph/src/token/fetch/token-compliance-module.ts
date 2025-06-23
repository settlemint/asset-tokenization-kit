import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TokenComplianceModule } from "../../../generated/schema";
import { fetchComplianceModule } from "../../compliance/fetch/compliance-module";
import { fetchToken } from "./token";

export function fetchTokenComplianceModule(
  tokenAddress: Address,
  complianceModuleAddress: Address
): TokenComplianceModule {
  let tokenComplianceModule = TokenComplianceModule.load(
    tokenAddress.concat(complianceModuleAddress)
  );

  if (!tokenComplianceModule) {
    tokenComplianceModule = new TokenComplianceModule(
      tokenAddress.concat(complianceModuleAddress)
    );
    tokenComplianceModule.token = fetchToken(tokenAddress).id;
    tokenComplianceModule.complianceModule = fetchComplianceModule(
      complianceModuleAddress
    ).id;
    tokenComplianceModule.encodedParams = Bytes.empty();
    tokenComplianceModule.addresses = [];
    tokenComplianceModule.countries = [];

    tokenComplianceModule.save();
  }

  return tokenComplianceModule;
}
