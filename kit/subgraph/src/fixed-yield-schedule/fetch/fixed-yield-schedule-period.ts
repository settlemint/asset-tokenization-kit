import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedulePeriod } from "../../../generated/schema";
import { setBigNumber } from "../../utils/bignumber";

export function fetchFixedYieldSchedulePeriod(
  address: Address
): TokenFixedYieldSchedulePeriod {
  let fixedYieldSchedulePeriod = TokenFixedYieldSchedulePeriod.load(address);

  if (!fixedYieldSchedulePeriod) {
    fixedYieldSchedulePeriod = new TokenFixedYieldSchedulePeriod(address);
    fixedYieldSchedulePeriod.schedule = Address.zero();
    fixedYieldSchedulePeriod.startDate = BigInt.zero();
    fixedYieldSchedulePeriod.endDate = BigInt.zero();
    setBigNumber(fixedYieldSchedulePeriod, "totalClaimed", BigInt.zero(), 18);
    setBigNumber(fixedYieldSchedulePeriod, "totalYield", BigInt.zero(), 18);
    fixedYieldSchedulePeriod.save();
  }

  return fixedYieldSchedulePeriod;
}
