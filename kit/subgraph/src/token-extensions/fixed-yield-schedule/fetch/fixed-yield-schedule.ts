import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedule } from "../../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleTemplate } from "../../../../generated/templates";
import { fetchAccount } from "../../../account/fetch/account";
import { DEFAULT_TOKEN_DECIMALS } from "../../../config/token";
import { setBigNumber } from "../../../utils/bignumber";

export function fetchFixedYieldSchedule(
  address: Address
): TokenFixedYieldSchedule {
  let fixedYieldSchedule = TokenFixedYieldSchedule.load(address);

  if (!fixedYieldSchedule) {
    fixedYieldSchedule = new TokenFixedYieldSchedule(address);
    fixedYieldSchedule.account = fetchAccount(address).id;
    fixedYieldSchedule.token = Address.zero();
    fixedYieldSchedule.createdAt = BigInt.zero();
    fixedYieldSchedule.createdBy = Address.zero();
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
    fixedYieldSchedule.deployedInTransaction = Bytes.empty();
    fixedYieldSchedule.save();
    FixedYieldScheduleTemplate.create(address);
  }

  return fixedYieldSchedule;
}
