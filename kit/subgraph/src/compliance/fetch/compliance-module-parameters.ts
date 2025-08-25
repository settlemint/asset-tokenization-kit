import { Bytes, store } from "@graphprotocol/graph-ts";
import {
  ComplianceModule,
  ComplianceModuleParameters,
  ExpressionNode,
  InvestorCountParams,
  TokenSupplyLimitParams,
} from "../../../generated/schema";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";
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
  decodeInvestorCountParams,
  isInvestorCountComplianceModule,
} from "../modules/investor-count-compliance-module";
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

      // Create ExpressionNode entities for the topic filter
      // First clear any existing nodes for this InvestorCountParams
      clearInvestorCountExpressionNodes(icp);

      // Then create new nodes
      for (let i = 0; i < decoded.topicFilter.length; i++) {
        const node = decoded.topicFilter[i];
        const nodeId = icp.id.concat(Bytes.fromI32(i));

        const expressionNode = new ExpressionNode(nodeId);
        expressionNode.investorCountParams = icp.id;
        expressionNode.index = i;

        // Set node type based on the enum value
        if (node.nodeType === 0) {
          expressionNode.nodeType = "TOPIC";
          // For TOPIC nodes, link to TopicScheme if needed
          const topicScheme = fetchTopicScheme(node.value);
          expressionNode.topicScheme = topicScheme.id;
        } else if (node.nodeType === 1) {
          expressionNode.nodeType = "AND";
        } else if (node.nodeType === 2) {
          expressionNode.nodeType = "OR";
        } else if (node.nodeType === 3) {
          expressionNode.nodeType = "NOT";
        }

        expressionNode.save();
      }

      complianceModuleParameters.investorCount = icp.id;
    } else {
      // Clear if not decodable
      if (icp !== null) {
        store.remove("InvestorCountParams", icp.id.toHexString());
      }
      complianceModuleParameters.investorCount = null;
    }
  }

  complianceModuleParameters.save();
}

function clearInvestorCountExpressionNodes(
  investorCountParams: InvestorCountParams
): void {
  // Load and remove existing expression nodes for InvestorCountParams
  // Similar to clearExpressionNodes but for investorCountParams
  for (let i = 0; i < 100; i++) {
    // Assume max 100 nodes
    const nodeId = investorCountParams.id.concat(Bytes.fromI32(i));
    const nodeIdHex = nodeId.toHexString();

    if (ExpressionNode.load(nodeId) !== null) {
      store.remove("ExpressionNode", nodeIdHex);
    } else {
      break; // No more nodes found
    }
  }
}
