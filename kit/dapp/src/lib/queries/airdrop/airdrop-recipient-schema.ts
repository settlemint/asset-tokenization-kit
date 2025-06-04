import { t, type StaticDecode } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";
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
          description: "Composite ID in format: airdropId-recipientAddress",
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

/**
 * TypeBox schema for user vesting data from The Graph
 *
 * Provides validation for minimal vesting information needed for status calculation
 */
export const UserVestingDataSchema = t.Optional(
  t.MaybeEmpty(
    t.Object(
      {
        user: t.Object({
          id: t.String({
            description: "User address",
          }),
        }),
        totalAmountAggregated: t.BigDecimal({
          description:
            "Total allocated amount across all indices for this user",
        }),
        claimedAmountTrackedByStrategy: t.BigDecimal({
          description:
            "Amount claimed according to strategy's internal tracking",
        }),
        vestingStart: t.Timestamp({
          description: "Timestamp when vesting started for this user",
        }),
        initialized: t.Boolean({
          description: "Whether vesting has been initialized for this user",
        }),
      },
      {
        description:
          "Schema for minimal vesting data needed for status calculation",
      }
    )
  )
);

export type UserVestingData = Static<typeof UserVestingDataSchema>;

/**
 * TypeBox schema for airdrop recipient data
 *
 * Provides validation for airdrop recipient information including:
 * complete airdrop details, amount allocated, Merkle tree index, claim data, and vesting data
 */
export const AirdropRecipientSchema = t.Object(
  {
    airdrop: t.Union(
      [
        t.Object({
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
        }),
        t.Object({
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
        }),
        t.Object({
          ...OnChainVestingAirdropSchema.properties,
          userVestingData: UserVestingDataSchema,
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
        }),
      ],
      {
        description: "Discriminated union of airdrop types based on type",
      }
    ),
    amount: t.StringifiedBigInt({
      description:
        "The amount allocated to this recipient as a raw big integer value",
    }),
    index: t.Number({
      description: "The index of the recipient in the Merkle tree",
    }),
  },
  {
    description:
      "Schema for airdrop recipient data including complete airdrop details, allocation details, claim status, and vesting information",
  }
);

export type AirdropRecipient = StaticDecode<typeof AirdropRecipientSchema>;
