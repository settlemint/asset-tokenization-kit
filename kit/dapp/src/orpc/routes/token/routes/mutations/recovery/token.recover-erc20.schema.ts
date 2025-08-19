import { apiBigInt } from "@/lib/zod/validators/bigint";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenRecoverERC20InputSchema =
  MutationInputSchemaWithContract.extend({
    tokenAddress: ethereumAddress.describe(
      "The address of the ERC20 token to recover"
    ),
    recipient: ethereumAddress.describe(
      "The address to send the recovered tokens to"
    ),
    amount: apiBigInt.describe("The amount of tokens to recover"),
  });

export type TokenRecoverERC20Input = z.infer<
  typeof TokenRecoverERC20InputSchema
>;
