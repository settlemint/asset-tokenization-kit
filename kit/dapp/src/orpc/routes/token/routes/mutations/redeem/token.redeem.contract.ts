import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenRedeemInputSchema } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenRedeemContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem",
    description: "Redeem tokens from one or more addresses",
    successDescription: "Tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemInputSchema)
  .output(TokenSchema);
