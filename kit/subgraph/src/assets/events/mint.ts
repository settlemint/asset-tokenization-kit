import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { MintEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function mintEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  to: Bytes,
  value: BigInt,
  decimals: number,
): MintEvent {
  const mintEvent = new MintEvent(id);
  mintEvent.eventName = EventName.Mint;
  mintEvent.timestamp = timestamp;
  mintEvent.emitter = emitter;
  mintEvent.sender = sender;
  mintEvent.to = to;
  mintEvent.value = toDecimals(value, decimals);
  mintEvent.valueExact = value;
  mintEvent.save();
  return mintEvent;
}
