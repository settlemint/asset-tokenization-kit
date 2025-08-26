import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isTimeLockComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("TimeLockComplianceModule"));
}

// ExpressionNode struct as defined in contracts/smart/interface/structs/ExpressionNode.sol
// struct ExpressionNode {
//   ExpressionType nodeType; // uint8 enum (TOPIC=0, AND=1, OR=2, NOT=3)
//   uint256 value;           // Topic ID for TOPIC nodes, ignored for operators
// }
export class DecodedExpressionNode {
  nodeType: i32; // 0=TOPIC, 1=AND, 2=OR, 3=NOT
  value: BigInt;

  constructor(nodeType: i32, value: BigInt) {
    this.nodeType = nodeType;
    this.value = value;
  }
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

  // Extract exemptionExpression (ExpressionNode[])
  const exemptionExpressionArray = tuple[2].toArray();
  const exemptionExpression: DecodedExpressionNode[] = [];
  for (let i = 0; i < exemptionExpressionArray.length; i++) {
    const nodeTuple = exemptionExpressionArray[i].toTuple();
    if (nodeTuple.length >= 2) {
      const nodeType = nodeTuple[0].toI32(); // ExpressionType enum as uint8
      const value = nodeTuple[1].toBigInt();
      exemptionExpression.push(new DecodedExpressionNode(nodeType, value));
    }
    // Skip malformed tuples - they won't be added to the result array
    // This prevents undefined entries while maintaining array integrity
  }

  return new DecodedTimeLockParams(
    holdPeriod,
    allowExemptions,
    exemptionExpression
  );
}