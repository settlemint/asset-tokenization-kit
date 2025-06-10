import { AirdropStatusSchema } from "@/lib/queries/airdrop/airdrop-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import {
  OnChainAirdropRecipientSchema,
  OnChainAirdropSchema,
} from "./airdrop-schema";

/**
 * TypeBox schema for airdrop recipient data
 *
 * Provides validation for airdrop recipient information including:
 * complete airdrop details, amount allocated, Merkle tree index, claim data, and vesting data
 */
export const UserAirdropSchema = t.Object(
  {
    ...OnChainAirdropSchema.properties,
    recipient: t.Object({
      ...t.Partial(OnChainAirdropRecipientSchema).properties,
      totalAmountAllocated: t.BigDecimal({
        description: "Total amount allocated to the recipient",
      }),
      totalAmountAllocatedExact: t.StringifiedBigInt({
        description: "Total amount allocated to the recipient",
      }),
    }),
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
  price: t.Price({
    description: "The price of the asset in the user's currency",
  }),
});

export type UserAirdropDetail = StaticDecode<typeof UserAirdropDetailSchema>;
