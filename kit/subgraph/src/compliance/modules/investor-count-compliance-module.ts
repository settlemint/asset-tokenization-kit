import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isInvestorCountComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("InvestorCountComplianceModule"));
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

// Encoded as ABI of InvestorCountConfig struct:
// struct InvestorCountConfig {
//   uint256 maxInvestors;
//   bool global;
//   uint16[] countryCodes;
//   uint256[] countryLimits;
//   ExpressionNode[] topicFilter;
// }
export class DecodedInvestorCountParams {
  maxInvestors: BigInt;
  global: boolean;
  countryCodes: Array<i32>;
  countryLimits: Array<BigInt>;
  topicFilter: Array<DecodedExpressionNode>;

  constructor(
    maxInvestors: BigInt,
    global: boolean,
    countryCodes: Array<i32>,
    countryLimits: Array<BigInt>,
    topicFilter: Array<DecodedExpressionNode>
  ) {
    this.maxInvestors = maxInvestors;
    this.global = global;
    this.countryCodes = countryCodes;
    this.countryLimits = countryLimits;
    this.topicFilter = topicFilter;
  }
}

export function decodeInvestorCountParams(
  data: Bytes
): DecodedInvestorCountParams | null {
  // ABI decode the entire struct at once using ethereum.decode
  const decoded = ethereum.decode(
    "(uint256,bool,uint16[],uint256[],(uint8,uint256)[])",
    data
  );

  if (decoded === null) {
    return null;
  }

  const tuple = decoded.toTuple();
  if (tuple.length < 5) {
    return null;
  }

  // Extract maxInvestors (uint256)
  const maxInvestors = tuple[0].toBigInt();

  // Extract global (bool)
  const global = tuple[1].toBoolean();

  // Extract countryCodes (uint16[])
  const countryCodesArray = tuple[2].toArray();
  const countryCodes = new Array<i32>(countryCodesArray.length);
  for (let i = 0; i < countryCodesArray.length; i++) {
    countryCodes[i] = countryCodesArray[i].toI32();
  }

  // Extract countryLimits (uint256[])
  const countryLimitsArray = tuple[3].toArray();
  const countryLimits = new Array<BigInt>(countryLimitsArray.length);
  for (let i = 0; i < countryLimitsArray.length; i++) {
    countryLimits[i] = countryLimitsArray[i].toBigInt();
  }

  // Extract topicFilter (ExpressionNode[])
  const topicFilterArray = tuple[4].toArray();
  const topicFilter: DecodedExpressionNode[] = [];
  for (let i = 0; i < topicFilterArray.length; i++) {
    const nodeTuple = topicFilterArray[i].toTuple();
    if (nodeTuple.length >= 2) {
      const nodeType = nodeTuple[0].toI32(); // ExpressionType enum as uint8
      const value = nodeTuple[1].toBigInt();
      topicFilter.push(new DecodedExpressionNode(nodeType, value));
    }
    // Skip malformed tuples - they won't be added to the result array
    // This prevents undefined entries while maintaining array integrity
  }

  return new DecodedInvestorCountParams(
    maxInvestors,
    global,
    countryCodes,
    countryLimits,
    topicFilter
  );
}
