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

export const AirdropStatusSchema = t.Union([
  t.Literal("UPCOMING"),
  t.Literal("ACTIVE"),
  t.Literal("ENDED"),
]);

export type AirdropStatus = StaticDecode<typeof AirdropStatusSchema>;

export const OffChainAirdropSchema = t.Object({
  distribution: AirdropDistributionListSchema,
  price: t.Price({
    description: "The price of the asset in the airdrop",
  }),
});

/**
 * TypeBox schema for airdrop recipient data from The Graph
 *
 * Provides validation for minimal claim information needed for status
 */
export const OnChainAirdropRecipientSchema = t.Object(
  {
    totalClaimedByRecipient: t.BigDecimal({
      description: "Total amount claimed by the recipient",
    }),
    totalClaimedByRecipientExact: t.StringifiedBigInt({
      description: "Total amount claimed by the recipient",
    }),
    firstClaimedTimestamp: t.Timestamp({
      description:
        "Timestamp when the recipient first claimed from this airdrop",
    }),
    lastClaimedTimestamp: t.Timestamp({
      description:
        "Timestamp when the recipient last claimed from this airdrop",
    }),
  },
  {
    description:
      "Schema for minimal airdrop recipient claim data needed for status",
  }
);

export type OnChainAirdropRecipient = StaticDecode<
  typeof OnChainAirdropRecipientSchema
>;

export const OffChainAirdropRecipientSchema = t.Object({
  totalAmountAllocated: t.BigDecimal({
    description: "Total amount allocated to the recipient",
  }),
  totalAmountAllocatedExact: t.StringifiedBigInt({
    description: "Total amount allocated to the recipient",
  }),
});

export type OffChainAirdropRecipient = StaticDecode<
  typeof OffChainAirdropRecipientSchema
>;

export const AirdropRecipientSchema = t.Object({
  ...t.Partial(OnChainAirdropRecipientSchema).properties,
  ...OffChainAirdropRecipientSchema.properties,
});

export type AirdropRecipient = StaticDecode<typeof AirdropRecipientSchema>;

export const OnChainAirdropClaimIndexSchema = t.Object({
  index: t.StringifiedBigInt({
    description: "The index of the claim",
  }),
  claimedAmount: t.BigDecimal({
    description: "The amount of the claim",
  }),
  claimedAmountExact: t.StringifiedBigInt({
    description: "The exact amount of the claim",
  }),
  timestamp: t.Timestamp({
    description: "The timestamp of the claim",
  }),
});

export type OnChainAirdropClaimIndex = StaticDecode<
  typeof OnChainAirdropClaimIndexSchema
>;

export const OffChainAirdropClaimIndexSchema = t.Object({
  index: t.StringifiedBigInt({
    description: "The index of the claim",
  }),
  amount: t.BigDecimal({
    description: "The amount of the claim",
  }),
  amountExact: t.StringifiedBigInt({
    description: "The exact amount of the claim",
  }),
});

export type OffChainAirdropClaimIndex = StaticDecode<
  typeof OffChainAirdropClaimIndexSchema
>;

export const AirdropClaimIndexSchema = t.Object({
  ...t.Partial(OnChainAirdropClaimIndexSchema).properties,
  ...OffChainAirdropClaimIndexSchema.properties,
});

export type AirdropClaimIndex = StaticDecode<typeof AirdropClaimIndexSchema>;
