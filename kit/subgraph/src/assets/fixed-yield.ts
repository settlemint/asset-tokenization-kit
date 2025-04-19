import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { Bond, YieldPeriod } from "../../generated/schema";
import { ERC20Yield as ERC20YieldContract } from "../../generated/templates/FixedYield/ERC20Yield";
import {
  FixedYield as FixedYieldContract,
  UnderlyingAssetTopUp as UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawn as UnderlyingAssetWithdrawnEvent,
  YieldClaimed as YieldClaimedEvent,
} from "../../generated/templates/FixedYield/FixedYield";
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";
import { eventId } from "../utils/events";
import { underlyingAssetTopUpEvent } from "./events/underlyingassettopup";
import { underlyingAssetWithdrawnEvent } from "./events/underlyingassetwithdrawn";
import { yieldClaimedEvent } from "./events/yieldclaimed";
import { fetchFixedYield } from "./fetch/fixed-yield";

// Define constant for basis points calculation
const RATE_BASIS_POINTS = BigInt.fromI32(10000);

export function handleYieldClaimed(event: YieldClaimedEvent): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const holder = fetchAccount(event.params.holder);
  const token = Bond.load(schedule.token);

  if (!token) {
    log.warning("Bond token {} not found for FixedYield {}", [
      schedule.token.toHexString(),
      event.address.toHexString(),
    ]);
    return;
  }

  log.info(
    "Fixed yield claimed event: amount={}, holder={}, sender={}, schedule={}, bond={}",
    [
      event.params.totalAmount.toString(),
      holder.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  yieldClaimedEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    holder.id,
    event.params.totalAmount,
    event.params.fromPeriod,
    event.params.toPeriod,
    event.params.periodAmounts,
    event.params.unclaimedYield,
    token.decimals
  );

  schedule.totalClaimedExact = schedule.totalClaimedExact.plus(
    event.params.totalAmount
  );
  schedule.totalClaimed = toDecimals(
    schedule.totalClaimedExact,
    token.decimals
  );
  schedule.unclaimedYieldExact = event.params.unclaimedYield;
  schedule.unclaimedYield = toDecimals(
    schedule.unclaimedYieldExact,
    token.decimals
  );
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.totalAmount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();

  const fixedYieldContract = FixedYieldContract.bind(event.address);
  const tokenContract = ERC20YieldContract.bind(Address.fromBytes(token.id));

  for (let i = 0; i < event.params.periodAmounts.length; i++) {
    const periodNumber = event.params.fromPeriod.plus(BigInt.fromI32(i));
    const periodId = Bytes.fromUTF8(
      event.address.toHexString() + "-" + periodNumber.toString()
    );
    const period = YieldPeriod.load(periodId);

    if (!period) {
      log.warning("YieldPeriod not found for id {}", [periodId.toHexString()]);
      continue; // Skip to the next iteration if period not found
    }

    // Update total claimed for the period if amount > 0
    const claimedAmount = event.params.periodAmounts[i];
    if (claimedAmount.gt(BigInt.zero())) {
      period.totalClaimedExact = period.totalClaimedExact.plus(claimedAmount);
      period.totalClaimed = toDecimals(
        period.totalClaimedExact,
        token.decimals
      );
      period.save();
    }

    // Calculate and update total yield for the period only if it hasn't been calculated yet
    if (period.totalYieldExact.notEqual(BigInt.zero())) {
      continue; // Skip yield calculation if already done
    }

    const periodEndCall = fixedYieldContract.try_periodEnd(periodNumber);
    if (periodEndCall.reverted) {
      log.warning(
        "Failed to get periodEnd timestamp for period {} from contract {}",
        [periodNumber.toString(), event.address.toHexString()]
      );
      continue;
    }
    const periodEndTimestamp = periodEndCall.value;

    const totalSupplyAtCall = tokenContract.try_totalSupplyAt(periodEndTimestamp);
    const basisCall = tokenContract.try_yieldBasisPerUnit(Address.zero());

    if (totalSupplyAtCall.reverted || basisCall.reverted) {
      log.warning(
        "Failed to get totalSupplyAt (reverted: {}) or basis (reverted: {}) for period {}, timestamp {}",
        [
          totalSupplyAtCall.reverted.toString(),
          basisCall.reverted.toString(),
          periodNumber.toString(),
          periodEndTimestamp.toString(),
        ]
      );
      continue;
    }

    const totalSupplyAt = totalSupplyAtCall.value;
    const basis = basisCall.value;

    if (basis.isZero() || RATE_BASIS_POINTS.isZero()) {
      log.warning(
        "Basis ({}) or RATE_BASIS_POINTS ({}) is zero for period {}, skipping total yield calculation.",
        [
          basis.toString(),
          RATE_BASIS_POINTS.toString(),
          periodNumber.toString(),
        ]
      );
      continue;
    }

    const totalYieldExact = totalSupplyAt
      .times(basis)
      .times(schedule.rate)
      .div(RATE_BASIS_POINTS);

    period.totalYieldExact = totalYieldExact;
    period.totalYield = toDecimals(totalYieldExact, token.decimals);

    log.info(
      "Calculated total yield for period {}: exact={}, decimal={}, timestamp={}, totalSupplyAt={}, basis={}, rate={}",
      [
        periodNumber.toString(),
        totalYieldExact.toString(),
        period.totalYield.toString(),
        periodEndTimestamp.toString(),
        totalSupplyAt.toString(),
        basis.toString(),
        schedule.rate.toString(),
      ]
    );

    period.save();
  }
}

export function handleUnderlyingAssetTopUp(
  event: UnderlyingAssetTopUpEvent
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset top up event: amount={}, from={}, sender={}, schedule={}, bond={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  // Create event record
  underlyingAssetTopUpEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    from.id,
    event.params.amount,
    token.decimals
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.plus(
    event.params.amount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawnEvent
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset withdrawn event: amount={}, to={}, sender={}, schedule={}, bond={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  // Create event record
  underlyingAssetWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    to.id,
    event.params.amount,
    token.decimals
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.amount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();
}
