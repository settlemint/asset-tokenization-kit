import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetEvent } from '../../../generated/schema';
import { fetchAccount } from '../../fetch/account';

export function assetEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  eventName: string
): AssetEvent {
  const assetEvent = new AssetEvent(id);
  assetEvent.eventName = eventName;
  assetEvent.timestamp = timestamp;
  assetEvent.emitter = emitter;
  assetEvent.sender = sender;
  assetEvent.save();

  const account = fetchAccount(sender);
  account.assetEventsCount = account.assetEventsCount + 1;
  account.save();

  return assetEvent;
}
