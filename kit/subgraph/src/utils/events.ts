import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, TransferEvent } from "../../generated/schema";

export function eventId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
}

export function updateMostRecentEvents(accountId: Bytes, eventId: Bytes): void {
  const account = Account.load(accountId);
  if (account) {
    // Initialize array if it doesn't exist
    if (!account.mostRecentEvents) {
      account.mostRecentEvents = [];
    }

    // Keep only the most recent events per asset id and event type
    const updatedEvents = account.mostRecentEvents.filter((eventId) => {
      // TODO: find a way to load the event without loading the entity
      const event = TransferEvent.load(eventId);
      return event !== null;
    });

    // Add new event to the beginning of the array
    updatedEvents.unshift(eventId);

    account.mostRecentEvents = updatedEvents;
    account.save();
  }
}
