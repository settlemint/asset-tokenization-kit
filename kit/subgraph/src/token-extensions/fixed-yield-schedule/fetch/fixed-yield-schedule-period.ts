import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedulePeriod } from "../../../../generated/schema";
import { DEFAULT_TOKEN_DECIMALS } from "../../../config/token";
import { setBigNumber } from "../../../utils/bignumber";

export function fetchFixedYieldSchedulePeriod(
  periodId: Bytes
): TokenFixedYieldSchedulePeriod {
  let fixedYieldSchedulePeriod = TokenFixedYieldSchedulePeriod.load(periodId);

  if (!fixedYieldSchedulePeriod) {
    fixedYieldSchedulePeriod = new TokenFixedYieldSchedulePeriod(periodId);
    fixedYieldSchedulePeriod.schedule = Address.zero();
    fixedYieldSchedulePeriod.startDate = BigInt.zero();
    fixedYieldSchedulePeriod.endDate = BigInt.zero();
    setBigNumber(
      fixedYieldSchedulePeriod,
      "totalClaimed",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    setBigNumber(
      fixedYieldSchedulePeriod,
      "totalYield",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    setBigNumber(
      fixedYieldSchedulePeriod,
      "totalUnclaimedYield",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    fixedYieldSchedulePeriod.deployedInTransaction = Bytes.empty();
    fixedYieldSchedulePeriod.completed = false;
    fixedYieldSchedulePeriod.save();
  }

  return fixedYieldSchedulePeriod;
}
