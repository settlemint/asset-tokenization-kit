import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenRedeemInputSchema } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenRedeemContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem",
    description:
      "Redeem tokens for underlying assets (supports redeem-all for bonds)",
    successDescription: "Tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
