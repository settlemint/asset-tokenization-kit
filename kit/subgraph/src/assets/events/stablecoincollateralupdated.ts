import { CollateralUpdatedEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function stablecoinCollateralUpdatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  oldAmount: BigInt,
  newAmount: BigInt,
  decimals: i32
): void {
  const event = new CollateralUpdatedEvent(id);
  event.eventName = "StableCoin Collateral Updated";
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.oldAmount = toDecimals(oldAmount, decimals);
  event.oldAmountExact = oldAmount;
  event.newAmount = toDecimals(newAmount, decimals);
  event.newAmountExact = newAmount;
  event.save();
}
