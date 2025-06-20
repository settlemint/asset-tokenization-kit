import { amount } from "@/lib/zod/validators/amount";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod/v4";

export const TokenMintSchema = z.object({
  id: z.string(),
  to: ethereumAddress.describe("The address to mint the tokens to"),
  amount: amount().describe("The amount of tokens to mint"),
});
