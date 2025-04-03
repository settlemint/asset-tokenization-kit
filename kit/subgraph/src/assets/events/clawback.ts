import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ClawbackEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function clawbackEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string,
  from: Bytes,
  to: Bytes,
  amount: BigInt,
  decimals: number
): ClawbackEvent {
  const event = new ClawbackEvent(id);
  event.eventName = EventName.Clawback;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = assetType;
  event.from = from;
  event.to = to;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
