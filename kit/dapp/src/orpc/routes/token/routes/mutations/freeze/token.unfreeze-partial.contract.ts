import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenUnfreezePartialInputSchema } from "@/orpc/routes/token/routes/mutations/freeze/token.unfreeze-partial.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenUnfreezePartialContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/unfreeze-partial",
    description: "Unfreeze previously frozen tokens",
    successDescription: "Tokens unfrozen successfully",
    tags: ["token"],
  })
  .input(TokenUnfreezePartialInputSchema)
  .output(TokenSchema);
