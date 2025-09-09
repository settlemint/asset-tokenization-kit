import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenHolderInputSchema,
  TokenHolderResponseSchema,
} from "./token.holder.schema";

/**
 * ORPC contract definition for token holder endpoint.
 *
 * This contract defines the API structure for querying a specific
 * token holder's balance information. It specifies the input validation
 * schema and the expected response format.
 */
export const tokenHolderContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/holder",
    description: "Get a specific token holder's balance information",
    successDescription: "Token holder balance details or null if not found",
    tags: ["token"],
  })
  .input(TokenHolderInputSchema)
  .output(TokenHolderResponseSchema);
