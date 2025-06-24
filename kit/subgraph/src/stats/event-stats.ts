import { Bytes } from "@graphprotocol/graph-ts";
import { EventStatsData } from "../../generated/schema";

/**
 * Track event statistics for system activity monitoring
 * @param emitterAccountId - The account that emitted the event
 * @param eventName - The name of the event
 */
export function trackEventStats(
  emitterAccountId: Bytes,
  eventName: string
): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const eventStats = new EventStatsData(1);

  eventStats.account = emitterAccountId;
  eventStats.eventName = eventName;

  eventStats.save();
}
