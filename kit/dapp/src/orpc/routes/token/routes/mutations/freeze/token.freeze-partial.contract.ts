import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenFreezePartialInputSchema } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-partial.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenFreezePartialContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/freeze-partial",
    description: "Freeze a specific amount of tokens for an address",
    successDescription: "Tokens frozen successfully",
    tags: ["token"],
  })
  .input(TokenFreezePartialInputSchema)
  .output(TokenSchema);
