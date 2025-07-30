import { Bytes } from "@graphprotocol/graph-ts";
import {
  ComplianceModuleParameters,
  type ComplianceModule,
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
) {
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

  complianceModuleParameters.save();
}
