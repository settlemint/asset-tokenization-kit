import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokensFrozenEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function tokensFrozenEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  user: Bytes,
  amount: BigInt,
  decimals: i32,
): TokensFrozenEvent {
  const event = new TokensFrozenEvent(id);
  event.eventName = EventName.TokensFrozen;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.user = user;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();

  return event;
}
