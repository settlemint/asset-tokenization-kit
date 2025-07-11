import { tokenRouter } from "@/orpc/procedures/token.router";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { type TokenActionsOutput } from "./token.actions.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

export const actions = tokenRouter.token.actions
  .use(theGraphMiddleware)
  .handler(({ input, context }) => {
    const { token } = context;
    const { status, type, assignedTo, limit, offset } = input;

    logger.info("Fetching actions for token", {
      tokenId: token.id,
      status,
      type,
      assignedTo,
      limit,
      offset,
    });

    try {
      // Since actions entity doesn't exist in the subgraph yet, return empty result
      // This can be implemented once the subgraph schema includes actions

      const result: TokenActionsOutput = {
        actions: [],
        total: 0,
        hasMore: false,
      };

      logger.info("Successfully fetched actions", {
        count: 0,
        hasMore: false,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching token actions", { error });

      // Return empty result on error to prevent UI breaking
      return {
        actions: [],
        total: 0,
        hasMore: false,
      };
    }
  });
