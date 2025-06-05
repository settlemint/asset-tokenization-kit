import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedulePeriod } from "../../../generated/schema";
import { setBigNumber } from "../../utils/bignumber";

export function fetchFixedYieldSchedulePeriod(
  periodId: Bytes
): TokenFixedYieldSchedulePeriod {
  let fixedYieldSchedulePeriod = TokenFixedYieldSchedulePeriod.load(periodId);

  if (!fixedYieldSchedulePeriod) {
    fixedYieldSchedulePeriod = new TokenFixedYieldSchedulePeriod(periodId);
    fixedYieldSchedulePeriod.schedule = Address.zero();
    fixedYieldSchedulePeriod.startDate = BigInt.zero();
    fixedYieldSchedulePeriod.endDate = BigInt.zero();
    setBigNumber(fixedYieldSchedulePeriod, "totalClaimed", BigInt.zero(), 18);
    setBigNumber(fixedYieldSchedulePeriod, "totalYield", BigInt.zero(), 18);
    setBigNumber(
      fixedYieldSchedulePeriod,
      "totalUnclaimedYield",
      BigInt.zero(),
      18
    );
    fixedYieldSchedulePeriod.save();
  }

  return fixedYieldSchedulePeriod;
}
