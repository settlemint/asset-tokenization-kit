import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenRecoverTokensInputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenRecoverTokensContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-tokens",
    description: "Recover tokens from a lost wallet to the caller's wallet",
    successDescription: "Tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverTokensInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
