import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, AssetCreatedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function assetCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  asset: Bytes,
  sender: Account,
): AssetCreatedEvent {
  assetEvent(id, timestamp, asset, sender, EventName.AssetCreated);
  const assetCreatedEvent = new AssetCreatedEvent(id);
  assetCreatedEvent.eventName = EventName.AssetCreated;
  assetCreatedEvent.timestamp = timestamp;
  assetCreatedEvent.emitter = asset
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.save();
  return assetCreatedEvent;
}
