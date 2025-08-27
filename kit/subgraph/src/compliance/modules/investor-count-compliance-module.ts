import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";
import {
  DecodedExpressionNode,
  decodeExpressionNodeArray,
} from "../shared/expression-nodes";

export function isInvestorCountComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("InvestorCountComplianceModule"));
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

  // Extract topicFilter (ExpressionNode[]) using shared utility
  const topicFilter = decodeExpressionNodeArray(tuple[4]);

  return new DecodedInvestorCountParams(
    maxInvestors,
    global,
    countryCodes,
    countryLimits,
    topicFilter
  );
}
