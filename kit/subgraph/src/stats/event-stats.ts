import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { EventStatsData } from "../../generated/schema";

/**
 * Track event statistics for system activity monitoring
 * @param emitterAccountId - The account that emitted the event
 * @param eventName - The name of the event
 * @param timestamp - The timestamp of the event
 */
export function trackEventStats(
  emitterAccountId: Bytes,
  eventName: string,
  timestamp: BigInt
): void {
  // Create a unique ID for this timeseries entry
  // Using timestamp + account + eventName to ensure uniqueness
  const id = timestamp
    .toString()
    .concat("-")
    .concat(emitterAccountId.toHexString())
    .concat("-")
    .concat(eventName);

  let eventStats = new EventStatsData(id);
  eventStats.timestamp = timestamp;
  eventStats.account = emitterAccountId;
  eventStats.eventName = eventName;
  eventStats.save();
}