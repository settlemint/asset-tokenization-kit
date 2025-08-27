import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import { 
  DecodedExpressionNode, 
  decodeExpressionNodeArray 
} from "../shared/expression-nodes";

export function isTransferApprovalComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("TransferApprovalComplianceModule"));
}

// Encoded as ABI of TransferApproval Config struct:
// struct Config {
//   address[] approvalAuthorities;
//   bool allowExemptions;
//   ExpressionNode[] exemptionExpression;
//   uint256 approvalExpiry;
//   bool oneTimeUse;
// }
export class DecodedTransferApprovalParams {
  approvalAuthorities: Array<Bytes>;
  allowExemptions: boolean;
  exemptionExpression: Array<DecodedExpressionNode>;
  approvalExpiry: BigInt;
  oneTimeUse: boolean;

  constructor(
    approvalAuthorities: Array<Bytes>,
    allowExemptions: boolean,
    exemptionExpression: Array<DecodedExpressionNode>,
    approvalExpiry: BigInt,
    oneTimeUse: boolean
  ) {
    this.approvalAuthorities = approvalAuthorities;
    this.allowExemptions = allowExemptions;
    this.exemptionExpression = exemptionExpression;
    this.approvalExpiry = approvalExpiry;
    this.oneTimeUse = oneTimeUse;
  }
}

export function decodeTransferApprovalParams(
  data: Bytes
): DecodedTransferApprovalParams | null {
  // ABI decode the entire struct at once using ethereum.decode
  const decoded = ethereum.decode(
    "(address[],bool,(uint8,uint256)[],uint256,bool)",
    data
  );

  if (decoded === null) {
    return null;
  }

  const tuple = decoded.toTuple();
  if (tuple.length < 5) {
    return null;
  }

  // Extract approvalAuthorities (address[])
  const approvalAuthoritiesArray = tuple[0].toArray();
  const approvalAuthorities = new Array<Bytes>();
  for (let i = 0; i < approvalAuthoritiesArray.length; i++) {
    approvalAuthorities.push(approvalAuthoritiesArray[i].toAddress());
  }

  // Extract allowExemptions (bool)
  const allowExemptions = tuple[1].toBoolean();

  // Extract exemptionExpression (ExpressionNode[]) using shared utility
  const exemptionExpression = decodeExpressionNodeArray(tuple[2]);

  // Extract approvalExpiry (uint256)
  const approvalExpiry = tuple[3].toBigInt();

  // Extract oneTimeUse (bool)
  const oneTimeUse = tuple[4].toBoolean();

  return new DecodedTransferApprovalParams(
    approvalAuthorities,
    allowExemptions,
    exemptionExpression,
    approvalExpiry,
    oneTimeUse
  );
}