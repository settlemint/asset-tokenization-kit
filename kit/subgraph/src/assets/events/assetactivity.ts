import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, AssetActivityEvent } from '../../../generated/schema';

export function assetActivityEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  eventName: string
): AssetActivityEvent {
  const assetEvent = new AssetActivityEvent(id);
  assetEvent.eventName = eventName;
  assetEvent.timestamp = timestamp;
  assetEvent.emitter = emitter;
  assetEvent.sender = sender.id;
  assetEvent.save();

  sender.assetActivityEventsCount = sender.assetActivityEventsCount + 1;
  sender.save();

  return assetEvent;
}
