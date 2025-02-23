import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { FixedYield } from "../../../generated/schema";
import { FixedYield as FixedYieldContract } from "../../../generated/templates/FixedYield/FixedYield";

export function fetchFixedYield(address: Address): FixedYield {
  let fixedYield = FixedYield.load(address);
  if (!fixedYield) {
    let endpoint = FixedYieldContract.bind(address);
    let token = endpoint.try_token();
    let underlyingAsset = endpoint.try_underlyingAsset();
    let startDate = endpoint.try_startDate();
    let endDate = endpoint.try_endDate();
    let rate = endpoint.try_rate();
    let interval = endpoint.try_interval();

    fixedYield = new FixedYield(address);
    fixedYield.token = token.reverted ? Address.zero() : token.value;
    fixedYield.underlyingAsset = underlyingAsset.reverted
      ? Address.zero()
      : underlyingAsset.value;
    fixedYield.startDate = startDate.reverted ? BigInt.zero() : startDate.value;
    fixedYield.endDate = endDate.reverted ? BigInt.zero() : endDate.value;
    fixedYield.rate = rate.reverted ? BigInt.zero() : rate.value;
    fixedYield.interval = interval.reverted ? BigInt.zero() : interval.value;
    fixedYield.totalClaimedExact = BigInt.zero();
    fixedYield.totalClaimed = BigDecimal.zero();
    fixedYield.unclaimedYieldExact = BigInt.zero();
    fixedYield.unclaimedYield = BigDecimal.zero();
    fixedYield.underlyingBalanceExact = BigInt.zero();
    fixedYield.underlyingBalance = BigDecimal.zero();
    fixedYield.save();
  }
  return fixedYield;
}
