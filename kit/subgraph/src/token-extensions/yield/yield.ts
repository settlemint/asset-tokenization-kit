import type {
  CheckpointUpdated,
  YieldScheduleSet,
} from '../../../generated/templates/Yield/Yield';
import { fetchEvent } from '../../event/fetch/event';
import { fetchFixedYieldSchedule } from '../fixed-yield-schedule/fetch/fixed-yield-schedule';
import { fetchYield } from './fetch/yield';

export function handleCheckpointUpdated(event: CheckpointUpdated): void {
  fetchEvent(event, 'CheckpointUpdated');
  // The transfer/burn/mint event handler of the token will update the balance
}

export function handleYieldScheduleSet(event: YieldScheduleSet): void {
  fetchEvent(event, 'YieldScheduleSet');
  const tokenYield = fetchYield(event.address);
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.params.schedule);
  tokenYield.schedule = fixedYieldSchedule.id;
  tokenYield.save();
  fixedYieldSchedule.token = event.address;
  fixedYieldSchedule.save();
}
