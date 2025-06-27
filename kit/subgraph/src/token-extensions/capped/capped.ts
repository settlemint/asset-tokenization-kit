import type { CapSet } from '../../../generated/templates/Capped/Capped';
import { fetchEvent } from '../../event/fetch/event';
import { fetchToken } from '../../token/fetch/token';
import { setBigNumber } from '../../utils/bignumber';
import { fetchCapped } from './fetch/capped';

export function handleCapSet(event: CapSet): void {
  fetchEvent(event, 'CapSet');
  const token = fetchToken(event.address);
  const capped = fetchCapped(event.address);
  setBigNumber(capped, 'cap', event.params.cap, token.decimals);
  capped.save();
}
