import { Bytes } from "@graphprotocol/graph-ts";
import {
  ComplianceModule,
  ComplianceModuleParameters,
  TokenSupplyLimitParams,
} from "../../../generated/schema";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import {
  decodeAddressListParams,
  isAddressListComplianceModule,
} from "../modules/address-list-compliance-module";
import {
  decodeCountryListParams,
  isCountryListComplianceModule,
} from "../modules/country-list-compliance-module";
import {
  decodeExpressionParams,
  isIdentityVerificationComplianceModule,
} from "../modules/identity-verification-compliance-module";
import {
  decodeTokenSupplyLimitParams,
  isTokenSupplyLimitComplianceModule,
} from "../modules/token-supply-limit-compliance-module";

export function fetchComplianceModuleParameters(
  configId: Bytes
): ComplianceModuleParameters {
  let complianceModuleParameters = ComplianceModuleParameters.load(configId);

  if (!complianceModuleParameters) {
    complianceModuleParameters = new ComplianceModuleParameters(configId);

    complianceModuleParameters.encodedParams = Bytes.empty();
    complianceModuleParameters.addresses = [];
    complianceModuleParameters.countries = [];

    complianceModuleParameters.save();
  }

  return complianceModuleParameters;
}

export function updateComplianceModuleParameters(
  complianceModuleParameters: ComplianceModuleParameters,
  complianceModule: ComplianceModule,
  encodedParams: Bytes
): void {
  complianceModuleParameters.encodedParams = encodedParams;

  // Handle different compliance module types
  if (
    isAddressListComplianceModule(getEncodedTypeId(complianceModule.typeId))
  ) {
    complianceModuleParameters.addresses =
      decodeAddressListParams(encodedParams);
  }
  if (
    isCountryListComplianceModule(getEncodedTypeId(complianceModule.typeId))
  ) {
    complianceModuleParameters.countries =
      decodeCountryListParams(encodedParams);
  }
  if (
    isIdentityVerificationComplianceModule(
      getEncodedTypeId(complianceModule.typeId)
    )
  ) {
    decodeExpressionParams(complianceModuleParameters, encodedParams);
  }
  if (
    isTokenSupplyLimitComplianceModule(
      getEncodedTypeId(complianceModule.typeId)
    )
  ) {
    const decoded = decodeTokenSupplyLimitParams(encodedParams);
    let tsl = TokenSupplyLimitParams.load(complianceModuleParameters.id);
    if (decoded !== null) {
      if (tsl === null) {
        tsl = new TokenSupplyLimitParams(complianceModuleParameters.id);
        tsl.parameters = complianceModuleParameters.id;
      }
      tsl.maxSupplyExact = decoded.maxSupplyExact;
      tsl.periodLengthDays = decoded.periodLengthDays;
      tsl.rolling = decoded.rolling;
      tsl.useBasePrice = decoded.useBasePrice;
      tsl.global = decoded.global;
      tsl.save();

      complianceModuleParameters.tokenSupplyLimit = tsl.id;
    } else {
      // Clear if not decodable
      if (tsl !== null) {
        // We do not delete entities in subgraph, just unlink
      }
      complianceModuleParameters.tokenSupplyLimit = null;
    }
  }

  complianceModuleParameters.save();
}
