import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
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
    asset: t.Object(
      {
        id: t.EthereumAddress(),
        symbol: t.AssetSymbol(),
        type: t.AssetType(),
        decimals: t.Decimals(),
      },
      {
        description: "The asset being airdropped",
      }
    ),
    owner: t.Object({
      id: t.EthereumAddress(),
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

export const AirdropListItem = OnChainAirdropSchema;

export type AirdropListItem = StaticDecode<typeof AirdropListItem>;

export const AirdropClaimStatusSchema = t.Union([
  t.Literal("READY"),
  t.Literal("PENDING"),
  t.Literal("CLAIMED"),
  t.Literal("EXPIRED"),
]);

export type AirdropClaimStatus = StaticDecode<typeof AirdropClaimStatusSchema>;

export const OffChainAirdropSchema = t.Object({
  distribution: AirdropDistributionListSchema,
});

export type OffChainAirdrop = StaticDecode<typeof OffChainAirdropSchema>;
