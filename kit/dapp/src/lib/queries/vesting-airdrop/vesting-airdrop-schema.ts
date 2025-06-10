import { t, type StaticDecode } from "@/lib/utils/typebox";
import {
  OffChainAirdropDistributionSchema,
  OnChainAirdropSchema,
} from "../airdrop/airdrop-schema";
import { LinearVestingStrategySchema } from "./linear-vesting-strategy-schema";

/**
 * Schema for vesting strategy data (supports different strategy types)
 */
export const VestingStrategySchema = t.Union([LinearVestingStrategySchema], {
  description:
    "Vesting strategy configuration (currently supports LinearVestingStrategy)",
});

/**
 * Schema for on-chain vesting airdrop data with vesting constraints
 * Extends the base airdrop schema with claim period and vesting strategy
 */
export const OnChainVestingAirdropSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    claimPeriodEnd: t.Timestamp({
      description: "The end time of the claim period for the vesting airdrop",
    }),
    strategy: VestingStrategySchema,
  },
  {
    description: "Complete on-chain data for vesting airdrops",
  }
);

/**
 * Vesting airdrop schema combining on-chain and off-chain data
 */
export const VestingAirdropSchema = t.Object(
  {
    ...OnChainVestingAirdropSchema.properties,
    ...OffChainAirdropDistributionSchema.properties,
  },
  {
    description:
      "Complete vesting airdrop data including both on-chain and off-chain properties",
  }
);

export type VestingAirdrop = StaticDecode<typeof VestingAirdropSchema>;
