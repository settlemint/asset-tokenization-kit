import { tokenRouter } from "@/orpc/procedures/token.router";
import { list as actionsList } from "@/orpc/routes/actions/routes/actions.list";
import type { ActionsListResponse } from "@/orpc/routes/actions/routes/actions.list.schema";
import { call } from "@orpc/server";

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
export const actions = tokenRouter.token.actions.handler(
  async ({ input, context }): Promise<ActionsListResponse> => {
    const targets = [input.tokenAddress];
    if (context.token?.yield?.schedule?.id) {
      targets.push(context.token.yield.schedule.id);
    }
    // Call the existing actions.list procedure using ORPC's call utility
    return await call(
      actionsList,
      {
        targets,
        status: input.status,
        name: input.name,
      },
      { context }
    );
  }
);
