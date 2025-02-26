import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ManagementFeeCollectedEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function managementFeeCollectedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  amount: BigInt,
  decimals: i32,
): ManagementFeeCollectedEvent {
  const event = new ManagementFeeCollectedEvent(id);
  event.eventName = EventName.ManagementFeeCollected;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
