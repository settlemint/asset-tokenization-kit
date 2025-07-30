import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenForcedRecoverInputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenForcedRecoverContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/forced-recover",
    description:
      "Force recover tokens from a specified address to the recipient",
    successDescription: "Tokens force recovered successfully",
    tags: ["token"],
  })
  .input(TokenForcedRecoverInputSchema)
  .output(TokenSchema);
