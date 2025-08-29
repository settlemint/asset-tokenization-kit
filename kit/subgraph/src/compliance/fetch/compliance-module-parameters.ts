import { Bytes, store } from "@graphprotocol/graph-ts";
import {
  ComplianceModule,
  ComplianceModuleParameters,
  ExpressionNode,
  InvestorCountParams,
  TimeLockParams,
  TokenSupplyLimitParams,
  TransferApprovalParams,
} from "../../../generated/schema";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import {
  createExpressionNodeEntities,
  clearExpressionNodeEntities,
} from "../shared/expression-nodes";
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
  decodeInvestorCountParams,
  isInvestorCountComplianceModule,
} from "../modules/investor-count-compliance-module";
import {
  decodeTimeLockParams,
  isTimeLockComplianceModule,
} from "../modules/time-lock-compliance-module";
import {
  decodeTokenSupplyLimitParams,
  isTokenSupplyLimitComplianceModule,
} from "../modules/token-supply-limit-compliance-module";
import {
  decodeTransferApprovalParams,
  isTransferApprovalComplianceModule,
} from "../modules/transfer-approval-compliance-module";

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
        store.remove("TokenSupplyLimitParams", tsl.id.toHexString());
      }
      complianceModuleParameters.tokenSupplyLimit = null;
    }
  }
  if (
    isInvestorCountComplianceModule(getEncodedTypeId(complianceModule.typeId))
  ) {
    const decoded = decodeInvestorCountParams(encodedParams);
    let icp = InvestorCountParams.load(complianceModuleParameters.id);
    if (decoded !== null) {
      if (icp === null) {
        icp = new InvestorCountParams(complianceModuleParameters.id);
        icp.parameters = complianceModuleParameters.id;
      }
      icp.maxInvestors = decoded.maxInvestors;
      icp.global = decoded.global;
      icp.countryCodes = decoded.countryCodes;
      icp.countryLimits = decoded.countryLimits;
      icp.save();

      // Create ExpressionNode entities for the topic filter using shared utility
      clearExpressionNodeEntities(icp.id);
      createExpressionNodeEntities(
        icp.id,
        decoded.topicFilter,
        (node: ExpressionNode, baseId: Bytes) => {
          node.investorCountParams = baseId;
        }
      );

      complianceModuleParameters.investorCount = icp.id;
    } else {
      // Clear if not decodable
      if (icp !== null) {
        store.remove("InvestorCountParams", icp.id.toHexString());
      }
      complianceModuleParameters.investorCount = null;
    }
  }
  if (isTimeLockComplianceModule(getEncodedTypeId(complianceModule.typeId))) {
    const decoded = decodeTimeLockParams(encodedParams);
    let tlp = TimeLockParams.load(complianceModuleParameters.id);
    if (decoded !== null) {
      if (tlp === null) {
        tlp = new TimeLockParams(complianceModuleParameters.id);
        tlp.parameters = complianceModuleParameters.id;
      }
      tlp.holdPeriod = decoded.holdPeriod;
      tlp.allowExemptions = decoded.allowExemptions;
      tlp.save();

      // Create ExpressionNode entities for the exemption expression using shared utility
      clearExpressionNodeEntities(tlp.id);
      createExpressionNodeEntities(
        tlp.id,
        decoded.exemptionExpression,
        (node: ExpressionNode, baseId: Bytes) => {
          node.timeLockParams = baseId;
        }
      );

      complianceModuleParameters.timeLock = tlp.id;
    } else {
      // Clear if not decodable
      if (tlp !== null) {
        store.remove("TimeLockParams", tlp.id.toHexString());
      }
      complianceModuleParameters.timeLock = null;
    }
  }
  if (
    isTransferApprovalComplianceModule(
      getEncodedTypeId(complianceModule.typeId)
    )
  ) {
    const decoded = decodeTransferApprovalParams(encodedParams);
    let tap = TransferApprovalParams.load(complianceModuleParameters.id);
    if (decoded !== null) {
      if (tap === null) {
        tap = new TransferApprovalParams(complianceModuleParameters.id);
        tap.parameters = complianceModuleParameters.id;
      }
      tap.approvalAuthorities = decoded.approvalAuthorities;
      tap.allowExemptions = decoded.allowExemptions;
      tap.approvalExpiry = decoded.approvalExpiry;
      tap.oneTimeUse = decoded.oneTimeUse;
      tap.save();

      // Create ExpressionNode entities for the exemption expression using shared utility
      clearExpressionNodeEntities(tap.id);
      createExpressionNodeEntities(
        tap.id,
        decoded.exemptionExpression,
        (node: ExpressionNode, baseId: Bytes) => {
          node.transferApprovalParams = baseId;
        }
      );

      complianceModuleParameters.transferApproval = tap.id;
    } else {
      // Clear if not decodable
      if (tap !== null) {
        store.remove("TransferApprovalParams", tap.id.toHexString());
      }
      complianceModuleParameters.transferApproval = null;
    }
  }

  complianceModuleParameters.save();
}
