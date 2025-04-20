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

  let endpoint = FixedYieldContract.bind(address);

  let token = endpoint.try_token();

  let underlyingAsset = endpoint.try_underlyingAsset();
  let decimals = underlyingAsset.reverted
    ? 18 // Default to 18 if call reverts
    : fetchAssetDecimals(underlyingAsset.value);

  let startDate = endpoint.try_startDate();
  let endDate = endpoint.try_endDate();
  let rate = endpoint.try_rate();
  let interval = endpoint.try_interval();
  let totalUnclaimedYieldExact = endpoint.try_totalUnclaimedYield();
  let periods = endpoint.try_allPeriods();

  fixedYield = new FixedYield(address);
  fixedYield.token = token.reverted ? Address.zero() : token.value;
  fixedYield.underlyingAsset = underlyingAsset.reverted
    ? Address.zero()
    : underlyingAsset.value;
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
  fixedYield.yieldForNextPeriodExact = BigInt.zero();
  fixedYield.yieldForNextPeriod = BigDecimal.zero();

  log.info("Starting to process {} yield periods for FixedYield: {}", [
    periods.reverted ? "0" : periods.value.length.toString(),
    address.toHexString(),
  ]);
  if (!periods.reverted && periods.value) {
    for (let i = 0; i < periods.value.length; i++) {
      const periodTimestamp = periods.value[i];
      const periodNumber = BigInt.fromI32(i + 1);
      const period = fetchFixedYieldPeriod(fixedYield, periodNumber);

      period.startDate = i === 0 ? fixedYield.startDate : periods.value[i - 1];
      period.endDate = periodTimestamp;

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

export function fetchFixedYieldPeriod(
  fixedYield: FixedYield,
  periodId: BigInt
): YieldPeriod {
  const id = fixedYieldPeriodId(fixedYield.id, periodId);
  let period = YieldPeriod.load(id);
  if (period) {
    return period;
  }

  period = new YieldPeriod(id);
  period.schedule = fixedYield.id;
  period.periodId = periodId;

  period.totalClaimedExact = BigInt.zero();
  period.totalClaimed = BigDecimal.zero();
  period.totalYieldExact = BigInt.zero();
  period.totalYield = BigDecimal.zero();
  period.startDate = BigInt.zero();
  period.endDate = BigInt.zero();

  period.save();

  return period;
}

export function fixedYieldPeriodId(address: Address, periodId: BigInt): Bytes {
  return Bytes.fromUTF8(address.toHexString() + "-" + periodId.toString());
}
