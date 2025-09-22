import { useQuery } from "@tanstack/react-query";

export interface YieldDistributionItem {
  timestamp: number;
  totalYield: number;
  claimed: number;
}

interface UseBondYieldDistributionOptions {
  assetAddress: string;
}

export function useBondYieldDistribution({
  assetAddress,
}: UseBondYieldDistributionOptions) {
  return useQuery({
    queryKey: ["bond-yield-distribution", assetAddress],
    queryFn: (): YieldDistributionItem[] => {
      // Return mock data for now
      // In the future, this would fetch real data from an API endpoint
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const startTime = now - oneYearMs;
      const monthMs = oneYearMs / 12;

      const data: YieldDistributionItem[] = [];

      // Generate 12 months of mock data
      for (let month = 0; month <= 12; month++) {
        const timestamp = startTime + month * monthMs;
        const totalYield = month * 1000; // Mock: $1000 per month
        const claimed = Math.floor(totalYield * 0.7); // Mock: 70% claimed

        data.push({
          timestamp,
          totalYield,
          claimed,
        });
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
