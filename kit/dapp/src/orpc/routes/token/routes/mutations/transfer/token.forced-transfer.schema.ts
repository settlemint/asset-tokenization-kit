import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Schema for custodian-driven forced transfers.
 */
export const TokenForcedTransferSchema = MutationInputSchemaWithContract.extend(
  {
    recipients: z
      .union([
        ethereumAddress.transform((address) => [address]),
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Recipient address(es) receiving the forced transfer"),
    amounts: z
      .union([
        apiBigInt.transform((amount) => [amount]),
        z.array(apiBigInt).min(1).max(100),
      ])
      .describe("Token amount(s) to move for each recipient"),
    from: z
      .union([
        ethereumAddress.transform((address) => [address]),
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Origin address(es) having tokens seized"),
  }
).superRefine((data, ctx) => {
  const { recipients, amounts, from } = data;

  if (from.length !== recipients.length || from.length !== amounts.length) {
    ctx.addIssue({
      code: "custom",
      path: ["amounts"],
      message:
        "Number of from addresses, recipients, and amounts must match for forced transfers",
    });
  }
});

export type TokenForcedTransferInput = z.infer<
  typeof TokenForcedTransferSchema
>;
