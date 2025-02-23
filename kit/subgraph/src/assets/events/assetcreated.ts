import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AssetCreatedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function assetCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  asset: Bytes,
  sender: Bytes,
): AssetCreatedEvent {
  const assetCreatedEvent = new AssetCreatedEvent(id);
  assetCreatedEvent.eventName = EventName.AssetCreated;
  assetCreatedEvent.timestamp = timestamp;
  assetCreatedEvent.emitter = asset;
  assetCreatedEvent.sender = sender;
  assetCreatedEvent.save();
  return assetCreatedEvent;
}
