import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, AssetEvent } from '../../../generated/schema';

export function assetEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  eventName: string
): AssetEvent {
  const assetEvent = new AssetEvent(id);
  assetEvent.eventName = eventName;
  assetEvent.timestamp = timestamp;
  assetEvent.emitter = emitter;
  assetEvent.sender = sender.id;
  assetEvent.save();

  sender.assetEventsCount = sender.assetEventsCount + 1;
  sender.save();

  return assetEvent;
}
