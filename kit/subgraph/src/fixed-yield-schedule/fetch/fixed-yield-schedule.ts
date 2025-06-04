import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedule } from "../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleTemplate } from "../../../generated/templates";
import { setBigNumber } from "../../utils/bignumber";

export function fetchFixedYieldSchedule(
  address: Address
): TokenFixedYieldSchedule {
  let fixedYieldSchedule = TokenFixedYieldSchedule.load(address);

  if (!fixedYieldSchedule) {
    fixedYieldSchedule = new TokenFixedYieldSchedule(address);
    fixedYieldSchedule.underlyingAsset = Address.zero();
    fixedYieldSchedule.endDate = BigInt.zero();
    fixedYieldSchedule.startDate = BigInt.zero();
    fixedYieldSchedule.rate = BigInt.zero();
    fixedYieldSchedule.interval = BigInt.zero();
    setBigNumber(fixedYieldSchedule, "totalClaimed", BigInt.zero(), 18);
    fixedYieldSchedule.save();
    FixedYieldScheduleTemplate.create(address);
  }

  return fixedYieldSchedule;
}
