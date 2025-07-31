import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenRedeemInputSchema,
  TokenRedeemOutputSchema,
} from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.schema";

export const tokenRedeemContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem",
    description: "Redeem tokens from one or more addresses",
    successDescription: "Tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemInputSchema)
  .output(TokenRedeemOutputSchema);
