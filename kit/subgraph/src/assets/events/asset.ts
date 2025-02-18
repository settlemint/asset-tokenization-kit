import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetEvent } from '../../../generated/schema';

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
  return assetEvent;
}
