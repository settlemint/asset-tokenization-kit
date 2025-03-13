import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenWithdrawnEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function tokenWithdrawnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string,
  token: Bytes,
  to: Bytes,
  amount: BigInt,
  decimals: i32
): TokenWithdrawnEvent {
  const event = new TokenWithdrawnEvent(id);
  event.eventName = EventName.TokenWithdrawn;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = assetType;
  event.token = token;
  event.to = to;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
