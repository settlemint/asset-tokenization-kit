import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenPauseInputSchema } from "@/orpc/routes/token/routes/mutations/pause/token.pause.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenPauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/pause",
    description: "Pause token transfers",
    successDescription: "Token paused successfully",
    tags: ["token"],
  })
  .input(TokenPauseInputSchema)
  .output(TokenSchema);
