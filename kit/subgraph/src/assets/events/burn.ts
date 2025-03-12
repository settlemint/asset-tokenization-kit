import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BurnEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function burnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string,
  from: Bytes,
  value: BigInt,
  decimals: number
): BurnEvent {
  const burnEvent = new BurnEvent(id);
  burnEvent.eventName = EventName.Burn;
  burnEvent.timestamp = timestamp;
  burnEvent.emitter = emitter;
  burnEvent.sender = sender;
  burnEvent.assetType = assetType;
  burnEvent.from = from;
  burnEvent.value = toDecimals(value, decimals);
  burnEvent.valueExact = value;
  burnEvent.save();
  return burnEvent;
}
