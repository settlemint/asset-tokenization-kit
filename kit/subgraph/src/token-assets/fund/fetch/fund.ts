import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenFund } from "../../../../generated/schema";
import { Fund as FundTemplate } from "../../../../generated/templates";

export function fetchFund(address: Address): TokenFund {
  let fund = TokenFund.load(address);

  if (!fund) {
    fund = new TokenFund(address);
    fund.managementFeeBps = 0;
    fund.lastFeeCollection = BigInt.zero();
    fund.save();
    FundTemplate.create(address);
  }

  return fund;
}
