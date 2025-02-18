import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, BondRedeemedEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function bondRedeemedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  holder: Bytes,
  bondAmount: BigInt,
  underlyingAmount: BigInt,
  decimals: i32
): BondRedeemedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.BondRedeemed);
  const event = new BondRedeemedEvent(id);
  event.eventName = EventName.BondRedeemed;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.holder = holder;
  event.bondAmount = toDecimals(bondAmount, decimals);
  event.bondAmountExact = bondAmount;
  event.underlyingAmount = toDecimals(underlyingAmount, decimals);
  event.underlyingAmountExact = underlyingAmount;
  event.save();
  return event;
}
