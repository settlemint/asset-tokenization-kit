import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenSetCapInputSchema } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap.schema";
import { MutationOutputSchema as TokenTransactionOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { eventIterator } from "@orpc/server";

export const tokenSetCapContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-cap",
    description: "Set the maximum supply cap for a capped token",
    successDescription: "Token cap updated successfully",
    tags: ["token"],
  })
  .input(TokenSetCapInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
