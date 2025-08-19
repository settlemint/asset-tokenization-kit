import { apiBigInt } from "@atk/zod/validators/bigint";
import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenRecoverERC20InputSchema = MutationInputSchemaWithContract.extend({
  tokenAddress: ethereumAddress.describe("The address of the ERC20 token to recover"),
  recipient: ethereumAddress.describe("The address to send the recovered tokens to"),
  amount: apiBigInt.describe("The amount of tokens to recover"),
});

export type TokenRecoverERC20Input = z.infer<typeof TokenRecoverERC20InputSchema>;
