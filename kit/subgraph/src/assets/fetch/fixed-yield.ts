import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { FixedYield } from "../../../generated/schema";
import { FixedYield as FixedYieldContract } from "../../../generated/templates/FixedYield/FixedYield";

export function fetchFixedYield(address: Address): FixedYield {
  let fixedYield = FixedYield.load(address);

  if (fixedYield) {
    return fixedYield;
  }

  // Try to bind the contract
  let endpoint = FixedYieldContract.bind(address);

  // Get token
  let token = endpoint.try_token();

  // Get underlying asset
  let underlyingAsset = endpoint.try_underlyingAsset();

  // Try to get other fields
  let startDate = endpoint.try_startDate();
  let endDate = endpoint.try_endDate();
  let rate = endpoint.try_rate();
  let interval = endpoint.try_interval();

  // Create the entity
  fixedYield = new FixedYield(address);
  fixedYield.token = token.reverted ? Address.zero() : token.value;
  fixedYield.underlyingAsset = underlyingAsset.reverted ? Address.zero() : underlyingAsset.value;
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

  // Save the entity
  fixedYield.save();

  return fixedYield;
}
