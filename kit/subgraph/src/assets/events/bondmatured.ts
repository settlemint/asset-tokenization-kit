import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BondMaturedEvent } from "../../../generated/schema";
import { AssetType, EventName } from "../../utils/enums";

export function bondMaturedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes
): BondMaturedEvent {
  const event = new BondMaturedEvent(id);
  event.eventName = EventName.BondMatured;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = AssetType.bond;
  event.save();
  return event;
}
