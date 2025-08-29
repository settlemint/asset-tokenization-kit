import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import {
  DecodedExpressionNode,
  decodeExpressionNodeArray,
} from "../shared/expression-nodes";

export function isTransferApprovalComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("TransferApprovalComplianceModule"));
}

// Encoded as ABI of TransferApproval Config struct:
// struct Config {
//   address[] approvalAuthorities;
//   bool allowExemptions;
//   bool oneTimeUse;
//   ExpressionNode[] exemptionExpression;
//   uint256 approvalExpiry;
// }
export class DecodedTransferApprovalParams {
  approvalAuthorities: Array<Bytes>;
  allowExemptions: boolean;
  oneTimeUse: boolean;
  exemptionExpression: Array<DecodedExpressionNode>;
  approvalExpiry: BigInt;

  constructor(
    approvalAuthorities: Array<Bytes>,
    allowExemptions: boolean,
    oneTimeUse: boolean,
    exemptionExpression: Array<DecodedExpressionNode>,
    approvalExpiry: BigInt
  ) {
    this.approvalAuthorities = approvalAuthorities;
    this.allowExemptions = allowExemptions;
    this.oneTimeUse = oneTimeUse;
    this.exemptionExpression = exemptionExpression;
    this.approvalExpiry = approvalExpiry;
  }
}

export function decodeTransferApprovalParams(
  data: Bytes
): DecodedTransferApprovalParams | null {
  // Validate input data is not empty
  if (data.length == 0) {
    return null;
  }

  // ABI decode the entire struct at once using ethereum.decode
  const decoded = ethereum.decode(
    "(address[],bool,bool,(uint8,uint256)[],uint256)",
    data
  );

  if (decoded === null) {
    return null;
  }

  const tuple = decoded.toTuple();
  // Validate exact tuple length to catch ABI changes
  if (tuple.length != 5) {
    return null;
  }

  // Extract approvalAuthorities (address[]) with type validation
  const approvalAuthoritiesValue = tuple[0];
  if (approvalAuthoritiesValue.kind != ethereum.ValueKind.ARRAY) {
    return null;
  }
  const approvalAuthoritiesArray = approvalAuthoritiesValue.toArray();
  const approvalAuthorities = new Array<Bytes>();
  for (let i = 0; i < approvalAuthoritiesArray.length; i++) {
    const addressValue = approvalAuthoritiesArray[i];
    if (addressValue.kind != ethereum.ValueKind.ADDRESS) {
      return null;
    }
    approvalAuthorities.push(addressValue.toAddress());
  }

  // Extract allowExemptions (bool) with type validation
  const allowExemptionsValue = tuple[1];
  if (allowExemptionsValue.kind != ethereum.ValueKind.BOOL) {
    return null;
  }
  const allowExemptions = allowExemptionsValue.toBoolean();

  // Extract oneTimeUse (bool) with type validation
  const oneTimeUseValue = tuple[2];
  if (oneTimeUseValue.kind != ethereum.ValueKind.BOOL) {
    return null;
  }
  const oneTimeUse = oneTimeUseValue.toBoolean();

  // Extract exemptionExpression (ExpressionNode[]) using shared utility
  const exemptionExpressionValue = tuple[3];
  if (exemptionExpressionValue.kind != ethereum.ValueKind.ARRAY) {
    return null;
  }
  const exemptionExpression = decodeExpressionNodeArray(
    exemptionExpressionValue
  );

  // Extract approvalExpiry (uint256) with type validation
  const approvalExpiryValue = tuple[4];
  if (approvalExpiryValue.kind != ethereum.ValueKind.UINT) {
    return null;
  }
  const approvalExpiry = approvalExpiryValue.toBigInt();

  return new DecodedTransferApprovalParams(
    approvalAuthorities,
    allowExemptions,
    oneTimeUse,
    exemptionExpression,
    approvalExpiry
  );
}
