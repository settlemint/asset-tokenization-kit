import { apiBigInt } from "@/lib/zod/validators/bigint";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

export const TokenRecoverERC20MessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingERC20Recovery: z
      .string()
      .optional()
      .default("Preparing to recover ERC20 tokens..."),
    submittingERC20Recovery: z
      .string()
      .optional()
      .default("Submitting ERC20 recovery transaction..."),
    erc20RecoverySuccessful: z
      .string()
      .optional()
      .default("ERC20 tokens recovered successfully"),
    erc20RecoveryFailed: z
      .string()
      .optional()
      .default("Failed to recover ERC20 tokens"),
  });

export const TokenRecoverERC20InputSchema =
  MutationInputSchemaWithContract.extend({
    tokenAddress: ethereumAddress.describe(
      "The address of the ERC20 token to recover"
    ),
    recipient: ethereumAddress.describe(
      "The address to send the recovered tokens to"
    ),
    amount: apiBigInt.describe("The amount of tokens to recover"),
    messages: TokenRecoverERC20MessagesSchema.optional(),
  });

export type TokenRecoverERC20Input = z.infer<
  typeof TokenRecoverERC20InputSchema
>;
export type TokenRecoverERC20Messages = z.infer<
  typeof TokenRecoverERC20MessagesSchema
>;
