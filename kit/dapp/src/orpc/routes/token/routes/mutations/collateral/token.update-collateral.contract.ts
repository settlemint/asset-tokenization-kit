import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenUpdateCollateralInputSchema } from "./token.update-collateral.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenUpdateCollateralContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/update-collateral",
    description: "Update collateral claim for token supply backing",
    successDescription: "Collateral updated successfully",
    tags: ["token"],
  })
  .input(TokenUpdateCollateralInputSchema)
  .output(TokenSchema);
