import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenUnpauseInputSchema } from "@/orpc/routes/token/routes/mutations/pause/token.unpause.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

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
