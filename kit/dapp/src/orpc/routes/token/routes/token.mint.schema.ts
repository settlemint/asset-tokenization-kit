import { amount } from "@/lib/zod/validators/amount";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { CreateSchema } from "@/orpc/routes/common/schemas/create.schema";

export const TokenMintSchema = CreateSchema.extend({
  contract: ethereumAddress.describe("The address of the token contract"),
  to: ethereumAddress.describe("The address to mint the tokens to"),
  amount: amount().describe("The amount of tokens to mint"),
});
