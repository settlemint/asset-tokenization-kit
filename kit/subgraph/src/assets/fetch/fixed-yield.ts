import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { FixedYield, YieldPeriod } from "../../../generated/schema";
import { FixedYield as FixedYieldContract } from "../../../generated/templates/FixedYield/FixedYield";
import { toDecimals } from "../../utils/decimals";
import { fetchAssetDecimals } from "./asset";

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
  let decimals = underlyingAsset.value
    ? fetchAssetDecimals(underlyingAsset.value)
    : null;

  // Try to get other fields
  let startDate = endpoint.try_startDate();
  let endDate = endpoint.try_endDate();
  let rate = endpoint.try_rate();
  let interval = endpoint.try_interval();
  let totalUnclaimedYieldExact = endpoint.try_totalUnclaimedYield();
  let periods = endpoint.try_allPeriods();

  // Create the entity
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
  fixedYield.unclaimedYieldExact = totalUnclaimedYieldExact.reverted
    ? BigInt.zero()
    : totalUnclaimedYieldExact.value;
  fixedYield.unclaimedYield = decimals
    ? toDecimals(fixedYield.unclaimedYieldExact, decimals)
    : BigDecimal.zero();
  fixedYield.underlyingBalanceExact = BigInt.zero();
  fixedYield.underlyingBalance = BigDecimal.zero();

  if (periods.value) {
    for (let i = 0; i < periods.value.length; i++) {
      const id = Bytes.fromUTF8(
        address.toHexString() + "-" + periods.value[i].toString()
      );
      const period = YieldPeriod.load(id);
      if (period) {
        period.schedule = fixedYield.id;
        period.periodId = BigInt.fromI32(i);
        period.totalClaimedExact = BigInt.zero();
        period.totalClaimed = BigDecimal.zero();
        period.startDate =
          i === 0 ? fixedYield.startDate : periods.value[i - 1];
        period.endDate = periods.value[i];

        // Save the period
        period.save();
      }
    }
  }

  // Save the entity
  fixedYield.save();

  return fixedYield;
}
