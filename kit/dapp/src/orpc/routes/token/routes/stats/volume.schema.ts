import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Input schema for asset volume endpoint
 */
export const VolumeInputSchema = z
  .object({
    address: ethereumAddress.describe("The token contract address"),
    timeRange: z
      .number()
      .int()
      .min(1)
      .max(365)
      .default(7)
      .describe("Number of days to look back for volume data"),
  })
  .strict();

/**
 * Output schema for asset-specific volume data
 */
export const VolumeOutputSchema = z.object({
  tokenId: z.string(),
  timeRangeDays: z.number().int().min(1),
  volumeHistory: z.array(
    z.object({
      timestamp: z.string(),
      volume: z.number().min(0),
      transactions: z.number().int().min(0),
    })
  ),
  totalVolume: z.string(),
});

export type VolumeInput = z.infer<typeof VolumeInputSchema>;
export type VolumeOutput = z.infer<typeof VolumeOutputSchema>;
