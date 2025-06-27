import { Address } from '@graphprotocol/graph-ts';
import type { DistributionCapUpdated } from '../../../../generated/templates/PushAirdrop/PushAirdrop';
import { fetchEvent } from '../../../event/fetch/event';
import { setBigNumber } from '../../../utils/bignumber';
import { getTokenDecimals } from '../../../utils/token-decimals';
import { fetchAirdrop } from './fetch/airdrop';
import { fetchPushAirdrop } from './fetch/push-airdrop';

export function handleDistributionCapUpdated(
  event: DistributionCapUpdated
): void {
  fetchEvent(event, 'DistributionCapUpdated');

  const pushAirdrop = fetchPushAirdrop(event.address);
  const airdrop = fetchAirdrop(event.address);
  const tokenAddress = Address.fromBytes(airdrop.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
  setBigNumber(
    pushAirdrop,
    'distributionCap',
    event.params.newCap,
    tokenDecimals
  );
  pushAirdrop.save();
}
