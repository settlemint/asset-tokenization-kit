import { amount } from "@/lib/zod/validators/amount";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/utils/user-verification";
import { z } from "zod/v4";

export const TokenMintSchema = z.object({
  ...UserVerificationSchema.shape,
  id: z.string(),
  to: ethereumAddress.describe("The address to mint the tokens to"),
  amount: amount().describe("The amount of tokens to mint"),
});
