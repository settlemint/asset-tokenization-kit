import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { AirdropType } from "@/lib/utils/typebox/airdrop-types";

/**
 * Transforms a type string to AirdropType using switch case
 *
 * @param typeString - The type string to transform
 * @returns The corresponding AirdropType
 */
function transformTypeToAirdropType(typeString: string): AirdropType {
  switch (typeString) {
    case "StandardAirdrop":
      return "standard";
    case "VestingAirdrop":
      return "vesting";
    case "PushAirdrop":
      return "push";
    default:
      return exhaustiveGuard(null);
  }
}

/**
 * TypeBox schema for on-chain airdrop data
 *
 * Provides validation for airdrop information including:
 * contract address, asset, total claimed amounts, and recipient count
 */
export const OnChainAirdropSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the airdrop",
    }),
    type: t
      .Transform(t.String())
      .Decode(transformTypeToAirdropType)
      .Encode((value: AirdropType) => value),
    asset: t.EthereumAddress({
      description: "The contract address of the token being airdropped",
    }),
    totalClaimed: t.BigDecimal({
      description:
        "The total claimed amount of the token in a human-readable decimal format",
    }),
    totalClaimedExact: t.StringifiedBigInt({
      description:
        "The exact total claimed amount of the token as a raw big integer value",
    }),
    totalRecipients: t.Number({
      description:
        "The total number of accounts who have actually claimed their airdrop assets",
    }),
  },
  {
    description:
      "On-chain data for airdrops including contract address, token, claimed amounts, and recipient information",
  }
);
export type OnChainAirdrop = StaticDecode<typeof OnChainAirdropSchema>;

/**
 * TypeBox schema for off-chain airdrop distribution data
 *
 * Provides validation for airdrop distribution entries including:
 * amount allocated to each recipient
 */
export const OffChainAirdropSchema = t.Object(
  {
    amount: t.BigDecimal({
      description: "The amount allocated to this recipient",
    }),
    recipient: t.EthereumAddress({
      description: "The Ethereum address of the airdrop recipient",
    }),
  },
  {
    description:
      "Off-chain data for airdrop distributions including recipient addresses and allocated amounts",
  }
);
export type OffChainAirdrop = StaticDecode<typeof OffChainAirdropSchema>;

/**
 * TypeBox schema for calculated airdrop fields
 *
 * Provides validation for computed airdrop metrics
 */
export const CalculatedAirdropSchema = t.Object(
  {
    claimPercentage: t.Number({
      description: "Percentage of total airdrop that has been claimed",
      minimum: 0,
      maximum: 100,
    }),
  },
  {
    description: "Calculated fields for airdrop metrics",
  }
);
export type CalculatedAirdrop = StaticDecode<typeof CalculatedAirdropSchema>;

/**
 * Combined schema for complete airdrop details
 *
 * Merges on-chain data with optional off-chain data
 */
export const AirdropDetailSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    ...t.Partial(OffChainAirdropSchema).properties,
  },
  {
    description:
      "Combined schema for complete airdrop details including on-chain data and off-chain distribution data",
  }
);
export type AirdropDetail = StaticDecode<typeof AirdropDetailSchema>;

export const AirdropListItem = OnChainAirdropSchema;

export type AirdropListItem = StaticDecode<typeof AirdropListItem>;
