import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenBurnInputSchema } from "@/orpc/routes/token/routes/mutations/burn/token.burn.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenBurnContract = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/burn",
    description: "Burn tokens from one or more addresses",
    successDescription: "Tokens burned successfully",
    tags: ["token"],
  })
  .input(TokenBurnInputSchema)
  .output(TokenSchema);
