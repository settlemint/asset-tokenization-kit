import { t, type StaticDecode } from "@/lib/utils/typebox";
import { OnChainAirdropSchema } from "./airdrop-schema";

/**
 * TypeBox schema for airdrop recipient data
 *
 * Provides validation for airdrop recipient information including:
 * complete airdrop details, amount allocated, and Merkle tree index
 */
export const AirdropRecipientSchema = t.Object(
  {
    airdrop: OnChainAirdropSchema,
    amount: t.StringifiedBigInt({
      description:
        "The amount allocated to this recipient as a raw big integer value",
    }),
    index: t.Number({
      description: "The index of the recipient in the Merkle tree",
    }),
    claimed: t.Optional(
      t.String({
        description:
          "Timestamp when the airdrop was claimed, null if not claimed",
      })
    ),
  },
  {
    description:
      "Schema for airdrop recipient data including complete airdrop details, allocation details and claim status",
  }
);

export type AirdropRecipient = StaticDecode<typeof AirdropRecipientSchema>;
