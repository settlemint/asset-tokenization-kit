import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { cache } from "react";
import type { Address } from "viem";
import { z } from "zod";

const yieldDistributionItemSchema = z.object({
  timestamp: z.number(),
  totalYield: z.number(),
  claimed: z.number()
});

type YieldDistributionData = z.infer<typeof yieldDistributionItemSchema>;

interface BondYieldDistributionParams {
  address: Address;
}

/**
 * Fetches yield distribution data for a bond
 * Shows total yield available over time and amount claimed
 */
export const getBondYieldDistribution = cache(
  async ({ address }: BondYieldDistributionParams): Promise<YieldDistributionData[]> => {
    try {
      // Get bond details to access yield data
      const bondData = await getBondDetail({ address });

      if (!bondData.yieldSchedule) {
        return [];
      }

      // Generate sample data based on the yield schedule
      // In a real implementation, this would come from actual historical data
      const startTime = Number(bondData.yieldSchedule.startDate) * 1000;
      const endTime = Number(bondData.yieldSchedule.endDate) * 1000;
      const now = Date.now();

      // Create an array of timestamps from start to current time
      const dataPoints = [];
      const totalPoints = 12; // Generate 12 data points
      const interval = (Math.min(now, endTime) - startTime) / totalPoints;

      let accumulatedYield = 0;
      let accumulatedClaimed = 0;

      for (let i = 0; i <= totalPoints; i++) {
        const timestamp = startTime + (i * interval);

        // Simulate increasing yield and claims over time
        const progressFactor = i / totalPoints;

        // Calculate total yield (use unclaimedYield + totalClaimed for total yield estimation)
        const totalYieldEstimate = bondData.yieldSchedule.unclaimedYield + bondData.yieldSchedule.totalClaimed;
        const totalYield = totalYieldEstimate * progressFactor;

        // Claimed is based on the totalClaimed property
        const claimed = bondData.yieldSchedule.totalClaimed * progressFactor;

        accumulatedYield = totalYield;
        accumulatedClaimed = claimed;

        dataPoints.push({
          timestamp,
          totalYield: accumulatedYield,
          claimed: accumulatedClaimed
        });
      }

      return dataPoints;
    } catch (error) {
      console.error("Error fetching bond yield distribution:", error);
      return [];
    }
  }
);