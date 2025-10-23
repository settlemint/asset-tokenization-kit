import { encodeAddressParams } from "@/lib/compliance/encoding/encode-address-params";
import { encodeCountryParams } from "@/lib/compliance/encoding/encode-country-params";
import { encodeExpressionParams } from "@/lib/compliance/encoding/encode-expression-params";
import { encodeInvestorCountParams } from "@/lib/compliance/encoding/encode-investor-count-params";
import { encodeTimeLockParams } from "@/lib/compliance/encoding/encode-timelock-params";
import { encodeTokenSupplyLimitParams } from "@/lib/compliance/encoding/encode-token-supply-limit-params";
import { encodeTransferApprovalParams } from "@/lib/compliance/encoding/encode-transfer-approval-params";
import type { ComplianceParams } from "@atk/zod/compliance";
import { convertInfixToPostfix } from "@atk/zod/expression-node";

/**
 * Encodes compliance parameters for a given compliance module type
 * @param params ComplianceParams
 * @returns Encoded compliance parameters as hex string
 */
export function encodeComplianceParams(params: ComplianceParams) {
  switch (params.typeId) {
    case "SMARTIdentityVerificationComplianceModule": {
      const expression = convertInfixToPostfix(params.values) ?? [];
      return encodeExpressionParams(expression);
    }
    case "CountryAllowListComplianceModule":
    case "CountryBlockListComplianceModule":
      return encodeCountryParams(params.values);
    case "AddressBlockListComplianceModule":
    case "IdentityAllowListComplianceModule":
    case "IdentityBlockListComplianceModule":
      return encodeAddressParams(params.values);
    case "TokenSupplyLimitComplianceModule":
      return encodeTokenSupplyLimitParams(params.values);
    case "InvestorCountComplianceModule":
      return encodeInvestorCountParams(params.values);
    case "TimeLockComplianceModule":
      return encodeTimeLockParams(params.values);
    case "TransferApprovalComplianceModule":
      return encodeTransferApprovalParams(params.values);
    default:
      throw new Error(
        `Unknown compliance module type: ${(params as { typeId: string }).typeId}`
      );
  }
}
