import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, TransferEvent } from "../../generated/schema";

export function eventId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
}
