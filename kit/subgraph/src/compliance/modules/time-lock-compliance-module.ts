import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import { 
  DecodedExpressionNode, 
  decodeExpressionNodeArray 
} from "../shared/expression-nodes";

export function isTimeLockComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("TimeLockComplianceModule"));
}

// Encoded as ABI of TimeLockParams struct:
// struct TimeLockParams {
//   uint256 holdPeriod;
//   bool allowExemptions;
//   ExpressionNode[] exemptionExpression;
// }
export class DecodedTimeLockParams {
  holdPeriod: BigInt;
  allowExemptions: boolean;
  exemptionExpression: Array<DecodedExpressionNode>;

  constructor(
    holdPeriod: BigInt,
    allowExemptions: boolean,
    exemptionExpression: Array<DecodedExpressionNode>
  ) {
    this.holdPeriod = holdPeriod;
    this.allowExemptions = allowExemptions;
    this.exemptionExpression = exemptionExpression;
  }
}

export function decodeTimeLockParams(
  data: Bytes
): DecodedTimeLockParams | null {
  // ABI decode the entire struct at once using ethereum.decode
  const decoded = ethereum.decode(
    "(uint256,bool,(uint8,uint256)[])",
    data
  );

  if (decoded === null) {
    return null;
  }

  const tuple = decoded.toTuple();
  if (tuple.length < 3) {
    return null;
  }

  // Extract holdPeriod (uint256)
  const holdPeriod = tuple[0].toBigInt();

  // Extract allowExemptions (bool)
  const allowExemptions = tuple[1].toBoolean();

  // Extract exemptionExpression (ExpressionNode[]) using shared utility
  const exemptionExpression = decodeExpressionNodeArray(tuple[2]);

  return new DecodedTimeLockParams(
    holdPeriod,
    allowExemptions,
    exemptionExpression
  );
}