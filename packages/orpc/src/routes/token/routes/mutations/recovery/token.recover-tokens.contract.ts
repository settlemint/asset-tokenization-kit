import { baseContract } from "../../../../../procedures/base.contract";
import { TokenRecoverTokensInputSchema } from "./token.recover-tokens.schema";
import { TokenSchema } from "../../token.read.schema";

export const tokenRecoverTokensContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-tokens",
    description: "Recover tokens from a lost wallet to the caller's wallet",
    successDescription: "Tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverTokensInputSchema)
  .output(TokenSchema);
