import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenForcedRecoverInputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenForcedRecoverContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/forced-recover",
    description:
      "Force recover tokens from a lost wallet to a new wallet (custodian only)",
    successDescription: "Tokens force recovered successfully",
    tags: ["token"],
  })
  .input(TokenForcedRecoverInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
