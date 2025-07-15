import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenUnpauseInputSchema,
  TokenUnpauseOutputSchema,
} from "@/orpc/routes/token/routes/mutations/pause/token.unpause.schema";
import { eventIterator } from "@orpc/server";

export const tokenUnpauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/unpause",
    description: "Unpause token transfers",
    successDescription: "Token unpaused successfully",
    tags: ["token"],
  })
  .input(TokenUnpauseInputSchema)
  .output(eventIterator(TokenUnpauseOutputSchema));
