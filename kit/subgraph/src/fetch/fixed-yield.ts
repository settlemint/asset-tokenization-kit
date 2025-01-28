import { Address, BigInt } from '@graphprotocol/graph-ts';
import { FixedYield } from '../../generated/schema';
import { FixedYield as FixedYieldContract } from '../../generated/templates/FixedYield/FixedYield';

export function fetchFixedYield(address: Address): FixedYield {
  let schedule = FixedYield.load(address);
  if (!schedule) {
    let endpoint = FixedYieldContract.bind(address);
    let token = endpoint.try_token();
    let underlyingAsset = endpoint.try_underlyingAsset();
    let startDate = endpoint.try_startDate();
    let endDate = endpoint.try_endDate();
    let rate = endpoint.try_rate();
    let interval = endpoint.try_interval();
    let currentPeriodId = endpoint.try_currentPeriodId();

    schedule = new FixedYield(address);
    schedule.token = token.reverted ? Address.zero() : token.value;
    schedule.underlyingAsset = underlyingAsset.reverted ? Address.zero() : underlyingAsset.value;
    schedule.startDate = startDate.reverted ? BigInt.zero() : startDate.value;
    schedule.endDate = endDate.reverted ? BigInt.zero() : endDate.value;
    schedule.rate = rate.reverted ? BigInt.zero() : rate.value;
    schedule.interval = interval.reverted ? BigInt.zero() : interval.value;
    schedule.currentPeriodId = currentPeriodId.reverted ? BigInt.zero() : currentPeriodId.value;
    schedule.save();
  }
  return schedule;
}
