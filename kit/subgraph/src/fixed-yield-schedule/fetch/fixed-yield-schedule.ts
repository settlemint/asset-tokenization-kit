import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedule } from "../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleTemplate } from "../../../generated/templates";
import { DEFAULT_TOKEN_DECIMALS } from "../../config/token";
import { setBigNumber } from "../../utils/bignumber";

export function fetchFixedYieldSchedule(
  address: Address
): TokenFixedYieldSchedule {
  let fixedYieldSchedule = TokenFixedYieldSchedule.load(address);

  if (!fixedYieldSchedule) {
    fixedYieldSchedule = new TokenFixedYieldSchedule(address);
    fixedYieldSchedule.token = Address.zero();
    fixedYieldSchedule.endDate = BigInt.zero();
    fixedYieldSchedule.startDate = BigInt.zero();
    fixedYieldSchedule.rate = BigInt.zero();
    fixedYieldSchedule.interval = BigInt.zero();
    setBigNumber(
      fixedYieldSchedule,
      "totalClaimed",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    setBigNumber(
      fixedYieldSchedule,
      "totalUnclaimedYield",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    setBigNumber(
      fixedYieldSchedule,
      "totalYield",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    fixedYieldSchedule.underlyingAsset = Address.zero();
    setBigNumber(
      fixedYieldSchedule,
      "underlyingAssetBalance",
      BigInt.zero(),
      DEFAULT_TOKEN_DECIMALS
    );
    fixedYieldSchedule.save();
    FixedYieldScheduleTemplate.create(address);
  }

  return fixedYieldSchedule;
}
