import { t } from "@/lib/utils/typebox";
import {
  OffChainAirdropSchema,
  OnChainAirdropSchema,
} from "../airdrop/airdrop-schema";

/**
 * Schema for on-chain standard airdrop data with timing constraints
 * Extends the base airdrop schema with start and end time fields
 */
export const OnChainStandardAirdropSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    startTime: t.Timestamp({
      description: "The start time of the airdrop campaign",
    }),
    endTime: t.Timestamp({
      description: "The end time of the airdrop campaign",
    }),
  },
  {
    description: "Complete on-chain data for standard airdrops",
  }
);

/**
 * Standard airdrop schema combining on-chain and off-chain data
 */
export const StandardAirdropSchema = t.Object(
  {
    ...OnChainStandardAirdropSchema.properties,
    ...OffChainAirdropSchema.properties,
  },
  {
    description:
      "Complete standard airdrop data including both on-chain and off-chain properties",
  }
);
