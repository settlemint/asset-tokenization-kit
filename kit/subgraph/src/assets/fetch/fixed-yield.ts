import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
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
  let decimals = underlyingAsset.reverted
    ? 18 // Default to 18 if call reverts
    : fetchAssetDecimals(underlyingAsset.value);

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
  fixedYield.underlyingAssetDecimals = decimals;
  fixedYield.startDate = startDate.reverted ? BigInt.zero() : startDate.value;
  fixedYield.endDate = endDate.reverted ? BigInt.zero() : endDate.value;
  fixedYield.rate = rate.reverted ? BigInt.zero() : rate.value;
  fixedYield.interval = interval.reverted ? BigInt.zero() : interval.value;
  fixedYield.totalClaimedExact = BigInt.zero();
  fixedYield.totalClaimed = BigDecimal.zero();
  fixedYield.unclaimedYieldExact = totalUnclaimedYieldExact.reverted
    ? BigInt.zero()
    : totalUnclaimedYieldExact.value;
  fixedYield.unclaimedYield = toDecimals(
    fixedYield.unclaimedYieldExact,
    fixedYield.underlyingAssetDecimals
  );
  fixedYield.underlyingBalanceExact = BigInt.zero();
  fixedYield.underlyingBalance = BigDecimal.zero();
  log.info("Starting to process {} yield periods for FixedYield: {}", [
    periods.reverted ? "0" : periods.value.length.toString(),
    address.toHexString(),
  ]);
  if (!periods.reverted && periods.value) {
    for (let i = 0; i < periods.value.length; i++) {
      const periodTimestamp = periods.value[i];
      const periodId = BigInt.fromI32(i);
      const id = Bytes.fromUTF8(
        address.toHexString() + "-" + periodId.toString() // Use period index for unique ID within this schedule
      );

      // Create a new YieldPeriod entity for each period timestamp
      let period = new YieldPeriod(id);

      period.schedule = fixedYield.id;
      period.periodId = periodId;
      period.totalClaimedExact = BigInt.zero();
      period.totalClaimed = BigDecimal.zero();
      // Calculate start date based on previous period's end date or schedule start date
      period.startDate = i === 0 ? fixedYield.startDate : periods.value[i - 1];
      period.endDate = periodTimestamp;

      // Save the newly created period
      period.save();
    }
  } else {
    log.warning("No periods found or call reverted for FixedYield: {}", [
      address.toHexString(),
    ]);
  }

  // Save the entity
  fixedYield.save();

  return fixedYield;
}
