import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TransferEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function transferEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  from: Bytes,
  to: Bytes,
  value: BigInt,
  decimals: number,
): TransferEvent {
  const transferEvent = new TransferEvent(id);
  transferEvent.eventName = EventName.Transfer;
  transferEvent.timestamp = timestamp;
  transferEvent.emitter = emitter;
  transferEvent.sender = sender;
  transferEvent.from = from;
  transferEvent.to = to;
  transferEvent.value = toDecimals(value, decimals);
  transferEvent.valueExact = value;
  transferEvent.save();
  return transferEvent;
}
