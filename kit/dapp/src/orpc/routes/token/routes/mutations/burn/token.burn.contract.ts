import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenBurnInputSchema,
  TokenBurnOutputSchema,
} from "@/orpc/routes/token/routes/mutations/burn/token.burn.schema";
import { eventIterator } from "@orpc/server";

export const tokenBurnContract = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/burn",
    description: "Burn tokens from one or more addresses",
    successDescription: "Tokens burned successfully",
    tags: ["token"],
  })
  .input(TokenBurnInputSchema)
  .output(eventIterator(TokenBurnOutputSchema));
