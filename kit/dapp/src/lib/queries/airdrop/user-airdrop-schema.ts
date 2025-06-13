import {
  AirdropClaimIndexSchema,
  AirdropRecipientSchema,
  AirdropStatusSchema,
} from "@/lib/queries/airdrop/airdrop-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { OnChainAirdropSchema } from "./airdrop-schema";

/**
 * TypeBox schema for airdrop recipient data
 *
 * Provides validation for airdrop recipient information including:
 * complete airdrop details, amount allocated, Merkle tree index, claim data, and vesting data
 */
export const UserAirdropSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    recipient: AirdropRecipientSchema,
    status: AirdropStatusSchema,
  },
  {
    description:
      "Schema for airdrop recipient data including complete airdrop details, allocation details, claim status, and vesting information",
  }
);

export type UserAirdrop = StaticDecode<typeof UserAirdropSchema>;

export const UserAirdropDetailSchema = t.Object({
  ...UserAirdropSchema.properties,
  recipient: t.Object({
    ...AirdropRecipientSchema.properties,
    claimIndices: t.Array(AirdropClaimIndexSchema),
  }),
  price: t.Price({
    description: "The price of the asset in the user's currency",
  }),
});

export type UserAirdropDetail = StaticDecode<typeof UserAirdropDetailSchema>;
