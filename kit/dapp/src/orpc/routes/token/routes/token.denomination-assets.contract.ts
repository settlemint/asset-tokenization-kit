import { baseContract } from "@/orpc/procedures/base.contract";
import { DenominationAssetListSchema } from "@/orpc/routes/token/routes/token.denomination-assets.schema";
import { TokenReadInputSchema } from "@/orpc/routes/token/routes/token.read.schema";

/**
 * Contract for token denomination assets endpoint
 */
export const tokenDenominationAssetsContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/denomination-assets",
    description:
      "Retrieves all bonds that use the specified token as their denomination asset",
    successDescription:
      "List of bonds that use the specified token as denomination asset",
    tags: ["token"],
  })
  .input(TokenReadInputSchema)
  .output(DenominationAssetListSchema);
