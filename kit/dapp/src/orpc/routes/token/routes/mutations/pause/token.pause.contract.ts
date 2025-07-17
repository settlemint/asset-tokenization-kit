import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenPauseInputSchema,
  TokenPauseOutputSchema,
} from "@/orpc/routes/token/routes/mutations/pause/token.pause.schema";
import { eventIterator } from "@orpc/server";

export const tokenPauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/pause",
    description: "Pause token transfers",
    successDescription: "Token paused successfully",
    tags: ["token"],
  })
  .input(TokenPauseInputSchema)
  .output(eventIterator(TokenPauseOutputSchema));
