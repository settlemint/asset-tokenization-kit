import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { YieldDistributionItem } from "@/lib/queries/bond/bond-schema";
import { cache } from "react";
import type { Address } from "viem";

interface BondYieldDistributionParams {
  address: Address;
}

/**
 * Fetches yield distribution data for a bond
 * Shows total yield available over time and amount claimed
 */
export const getBondYieldDistribution = cache(
  async ({
    address,
  }: BondYieldDistributionParams): Promise<YieldDistributionItem[]> => {
    try {
      // Get bond details to access yield data
      const bondData = await getBondDetail({ address });

      if (!bondData.yieldSchedule) {
        return [];
      }

      // Get actual yield schedule periods data from the bond
      const { periods, startDate, endDate, totalClaimed } =
        bondData.yieldSchedule;

      // If there are no periods, return empty array
      if (!periods || periods.length === 0) {
        return [];
      }

      // Convert timestamps to milliseconds
      const startTime = Number(startDate) * 1000;
      const endTime = Number(endDate) * 1000;
      const now = Date.now();

      // Create distribution data from actual period data
      const dataPoints: YieldDistributionItem[] = [];

      // Add starting point (zero values)
      dataPoints.push({
        timestamp: startTime,
        totalYield: 0,
        claimed: 0,
      });

      // Sort periods by start date
      const sortedPeriods = [...periods].sort(
        (a, b) => Number(a.startDate) - Number(b.startDate)
      );

      // Running totals for accumulation
      let accumulatedYield = 0;
      let accumulatedClaimed = 0;

      // Add data points for each period
      for (const period of sortedPeriods) {
        const periodStartTime = Number(period.startDate) * 1000;

        // Only include periods up to current time
        if (periodStartTime > now) {
          break;
        }

        // Add the period's yield to the total (estimated from rate and duration)
        const periodDuration =
          Number(period.endDate) - Number(period.startDate);
        const periodYield =
          (Number(period.rate) * periodDuration) / (365 * 24 * 60 * 60);

        accumulatedYield += periodYield;
        accumulatedClaimed += Number(period.totalClaimed);

        dataPoints.push({
          timestamp: periodStartTime,
          totalYield: accumulatedYield,
          claimed: accumulatedClaimed,
        });
      }

      // Add current point if we're between start and end time
      if (now > startTime && now < endTime && dataPoints.length > 0) {
        // Get the latest data point
        const lastPoint = dataPoints[dataPoints.length - 1];

        // Add current point using latest accumulated values
        // but adjust based on current time proportion if needed
        dataPoints.push({
          timestamp: now,
          totalYield: lastPoint.totalYield,
          claimed: Number(totalClaimed), // Use actual claimed amount from bond data
        });
      }

      // Add end point if it's in the future
      if (endTime > now && dataPoints.length > 0) {
        // Use the latest accumulated yield as the final value
        const lastPoint = dataPoints[dataPoints.length - 1];

        dataPoints.push({
          timestamp: endTime,
          totalYield: lastPoint.totalYield,
          claimed: lastPoint.claimed,
        });
      }

      return dataPoints;
    } catch (error) {
      console.error("Error fetching bond yield distribution:", error);
      return [];
    }
  }
);
