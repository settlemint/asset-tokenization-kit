import { call } from "@orpc/server";
import { authRouter } from "@/orpc/procedures/auth.router";
import { list as actionsList } from "@/orpc/routes/actions/routes/actions.list";
import type { ActionsListResponse } from "@/orpc/routes/actions/routes/actions.list.schema";

/**
 * Token actions route handler.
 *
 * Retrieves all actions targeting a specific token address that are accessible
 * to the authenticated user. This reuses the existing actions.list procedure
 * with the target filter pre-populated with the tokenAddress.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /token/{tokenAddress}/actions
 *
 * @param input - Contains tokenAddress and optional filters (status, name)
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<ActionsListResponse> - List of actions for the token
 */
export const actions = authRouter.token.actions.handler(
  async ({ input, context }): Promise<ActionsListResponse> => {
    // Call the existing actions.list procedure using ORPC's call utility
    return await call(
      actionsList,
      {
        target: input.tokenAddress,
        status: input.status,
        name: input.name,
      },
      { context }
    );
  }
);
