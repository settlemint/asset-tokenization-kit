import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { UnderlyingAssetWithdrawnEvent } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";
import { AssetType, EventName } from "../../utils/enums";

export function underlyingAssetWithdrawnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  to: Bytes,
  amount: BigInt,
  decimals: i32
): UnderlyingAssetWithdrawnEvent {
  const event = new UnderlyingAssetWithdrawnEvent(id);
  event.eventName = EventName.UnderlyingAssetWithdrawn;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = AssetType.bond;
  event.to = to;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
