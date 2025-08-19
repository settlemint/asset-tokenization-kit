import { baseContract } from "../../../../../procedures/base.contract";
import { TokenBurnInputSchema } from "./token.burn.schema";
import { TokenSchema } from "../../token.read.schema";

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
