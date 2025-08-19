import { baseContract } from "@/procedures/base.contract";
import { TokenUnpauseInputSchema } from "@/routes/token/routes/mutations/pause/token.unpause.schema";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";

export const tokenUnpauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/unpause",
    description: "Unpause token transfers",
    successDescription: "Token unpaused successfully",
    tags: ["token"],
  })
  .input(TokenUnpauseInputSchema)
  .output(TokenSchema);
