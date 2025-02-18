import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CollateralUpdatedEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function stablecoinCollateralUpdatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  oldAmount: BigInt,
  newAmount: BigInt,
  decimals: i32
): void {
  assetEvent(id, timestamp, emitter, sender, EventName.CollateralUpdated);
  const event = new CollateralUpdatedEvent(id);
  event.eventName = EventName.CollateralUpdated;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.oldAmount = toDecimals(oldAmount, decimals);
  event.oldAmountExact = oldAmount;
  event.newAmount = toDecimals(newAmount, decimals);
  event.newAmountExact = newAmount;
  event.save();
}
