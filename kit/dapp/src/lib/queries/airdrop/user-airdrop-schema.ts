import { AirdropDistributionSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { VestingDataSchema } from "@/lib/queries/vesting-airdrop/linear-vesting-strategy-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { OnChainPushAirdropSchema } from "../push-airdrop/push-airdrop-schema";
import { OnChainStandardAirdropSchema } from "../standard-airdrop/standard-airdrop-schema";
import { OnChainVestingAirdropSchema } from "../vesting-airdrop/vesting-airdrop-schema";

/**
 * TypeBox schema for airdrop recipient data from The Graph
 *
 * Provides validation for minimal claim information needed for status
 */
export const AirdropClaimSchema = t.Optional(
  t.MaybeEmpty(
    t.Object(
      {
        id: t.String({
          description: "Composite ID in format: airdropIdrecipientAddress",
        }),
        firstClaimedTimestamp: t.Timestamp({
          description:
            "Timestamp when the recipient first claimed from this airdrop",
        }),
      },
      {
        description:
          "Schema for minimal airdrop recipient claim data needed for status",
      }
    )
  )
);

export type AirdropClaim = StaticDecode<typeof AirdropClaimSchema>;

export const StandardAirdropRecipientSchema = t.Object({
  ...OnChainStandardAirdropSchema.properties,
  claimed: t.Optional(
    t.MaybeEmpty(
      t.Timestamp({
        description:
          "Timestamp when the airdrop was claimed, null if not claimed",
      })
    )
  ),
  claimData: AirdropClaimSchema,
  __typename: t.Literal("StandardAirdrop"),
});

export type StandardAirdropRecipient = StaticDecode<
  typeof StandardAirdropRecipientSchema
>;

export const PushAirdropRecipientSchema = t.Object({
  ...OnChainPushAirdropSchema.properties,
  claimed: t.Optional(
    t.MaybeEmpty(
      t.Timestamp({
        description:
          "Timestamp when the airdrop was claimed, null if not claimed",
      })
    )
  ),
  claimData: AirdropClaimSchema,
  __typename: t.Literal("PushAirdrop"),
});

export type PushAirdropRecipient = StaticDecode<
  typeof PushAirdropRecipientSchema
>;

export const VestingAirdropRecipientSchema = t.Object({
  ...OnChainVestingAirdropSchema.properties,
  userVestingData: VestingDataSchema,
  claimed: t.Optional(
    t.MaybeEmpty(
      t.Timestamp({
        description:
          "Timestamp when the airdrop was claimed, null if not claimed",
      })
    )
  ),
  claimData: AirdropClaimSchema,
  __typename: t.Literal("VestingAirdrop"),
});

export type VestingAirdropRecipient = StaticDecode<
  typeof VestingAirdropRecipientSchema
>;

/**
 * TypeBox schema for airdrop recipient data
 *
 * Provides validation for airdrop recipient information including:
 * complete airdrop details, amount allocated, Merkle tree index, claim data, and vesting data
 */
export const UserAirdropSchema = t.Object(
  {
    airdrop: t.Union(
      [
        StandardAirdropRecipientSchema,
        PushAirdropRecipientSchema,
        VestingAirdropRecipientSchema,
      ],
      {
        description: "Discriminated union of airdrop types based on type",
      }
    ),
    ...AirdropDistributionSchema.properties,
  },
  {
    description:
      "Schema for airdrop recipient data including complete airdrop details, allocation details, claim status, and vesting information",
  }
);

export type UserAirdrop = StaticDecode<typeof UserAirdropSchema>;

export const UserAirdropDetailSchema = t.Object({
  ...UserAirdropSchema.properties,
  price: t.Price({
    description: "The price of the asset in the user's currency",
  }),
});

export type UserAirdropDetail = StaticDecode<typeof UserAirdropDetailSchema>;
