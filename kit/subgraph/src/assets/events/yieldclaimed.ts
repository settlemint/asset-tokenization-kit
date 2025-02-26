import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { YieldClaimedEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from "../../utils/enums";

export function yieldClaimedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  holder: Bytes,
  totalAmount: BigInt,
  fromPeriod: BigInt,
  toPeriod: BigInt,
  periodAmounts: BigInt[],
  unclaimedYield: BigInt,
  decimals: i32,
): YieldClaimedEvent {
  const event = new YieldClaimedEvent(id);
  event.eventName = EventName.YieldClaimed;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.holder = holder;
  event.totalAmount = toDecimals(totalAmount, decimals);
  event.totalAmountExact = totalAmount;
  event.fromPeriod = fromPeriod;
  event.toPeriod = toPeriod;
  event.periodAmounts = periodAmounts;
  event.unclaimedYield = toDecimals(unclaimedYield, decimals);
  event.unclaimedYieldExact = unclaimedYield;
  event.save();
  return event;
}
