import type { TimeRange } from "@/components/blocks/charts/time-series";
import { differenceInSeconds } from "date-fns";

/**
 * Calculates the maximum time range for charts based on the deployment date of an asset.
 *
 * @param deployedOn - The deployment timestamp of the asset (in seconds as a bigint).
 * @returns The appropriate TimeRange ("24h", "7d", "30d", "90d").
 */
export const calculateMaxRange = (deployedOn: bigint): TimeRange => {
  const now = new Date();
  // Convert bigint seconds to milliseconds for Date constructor
  const deployedDate = new Date(Number(deployedOn) * 1000);
  const diffSeconds = differenceInSeconds(now, deployedDate);

  // Determine the appropriate range based on the age of the asset
  if (diffSeconds < 24 * 60 * 60) {
    // Less than 24 hours
    return "24h";
  }
  if (diffSeconds < 7 * 24 * 60 * 60) {
    // Less than 7 days
    return "7d";
  }
  if (diffSeconds < 30 * 24 * 60 * 60) {
    // Less than 30 days
    return "30d";
  }
  // Default to 90d if older than 30 days
  return "90d";
};
