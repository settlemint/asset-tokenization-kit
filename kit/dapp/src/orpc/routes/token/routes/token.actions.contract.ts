import { baseContract } from "@/orpc/procedures/base.contract";
import {
  ActionsListSchema,
  ActionsListResponseSchema,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Input schema for token actions endpoint.
 * Combines the tokenAddress path parameter with optional action filters.
 */
const TokenActionsInputSchema = z
  .object({
    tokenAddress: ethereumAddress.describe(
      "The token contract address to filter actions by"
    ),
  })
  .extend(ActionsListSchema.shape);

export const tokenActionsContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/actions",
    description: "Get actions for a specific token",
    successDescription: "List of actions targeting the specified token",
    tags: ["token", "actions"],
  })
  .input(TokenActionsInputSchema)
  .output(ActionsListResponseSchema);
