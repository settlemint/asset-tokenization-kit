import { t, type StaticDecode } from "@/lib/utils/typebox";
import {
  OffChainAirdropDistributionSchema,
  OnChainAirdropSchema,
} from "../airdrop/airdrop-schema";

/**
 * Schema for on-chain push airdrop data with distribution tracking
 * Extends the base airdrop schema with total distributed amount
 */
export const OnChainPushAirdropSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    totalDistributed: t.BigDecimal({
      description:
        "The total distributed amount of the token in a human-readable decimal format",
    }),
    distributionCap: t.BigDecimal({
      description:
        "The total amount of tokens that can be distributed by the push airdrop",
    }),
  },
  {
    description: "Complete on-chain data for push airdrops",
  }
);

/**
 * Push airdrop schema combining on-chain and off-chain data
 */
export const PushAirdropSchema = t.Object(
  {
    ...OnChainPushAirdropSchema.properties,
    ...OffChainAirdropDistributionSchema.properties,
  },
  {
    description:
      "Complete push airdrop data including both on-chain and off-chain properties",
  }
);

/**
 * TypeScript type for PushAirdrop
 */
export type PushAirdrop = StaticDecode<typeof PushAirdropSchema>;
