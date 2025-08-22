import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { EventsResponseSchema } from "@/orpc/routes/token/routes/token.events.schema";

/**
 * GraphQL query for retrieving token events from TheGraph.
 *
 * Events represent all actions that occur on token contracts, including
 * transfers, mints, burns, role changes, and compliance updates. Each event
 * contains details about when it occurred, who triggered it, and what changed.
 *
 * This query fetches all events for a specific token (emitter) ordered by
 * blockTimestamp in descending order to show the most recent events first.
 */
const TOKEN_EVENTS_QUERY = theGraphGraphql(`
  query TokenEventsQuery($emitter: String!) {
    events(
      where: { emitter: $emitter }
    ) @fetchAll {
      id
      eventName
      txIndex
      blockNumber
      blockTimestamp
      transactionHash
      emitter {
        id
      }
      sender {
        id
      }
      values {
        id
        name
        value
      }
    }
  }
`);

/**
 * Token events listing route handler.
 *
 * Retrieves a list of all events for a specific token contract.
 * This endpoint provides a comprehensive audit trail of all actions
 * performed on the token, useful for compliance reporting, activity
 * monitoring, and transaction history views.
 *
 * Authentication: Required (uses token router)
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/{tokenAddress}/events
 *
 * @param context - Request context with TheGraph client and token from middleware
 * @returns Promise<EventsResponse> - Object containing array of event objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all events for a specific token
 * const response = await orpc.token.events.query({
 *   tokenAddress: '0x1234567890abcdef...'
 * });
 *
 * // Access the events
 * response.events.forEach(event => {
 *   console.log(`Event: ${event.eventName} at block ${event.blockNumber}`);
 * });
 * ```
 *
 * @see {@link EventSchema} for the response structure
 */
export const events = tokenRouter.token.events.handler(async ({ context }) => {
  const response = await context.theGraphClient.query(TOKEN_EVENTS_QUERY, {
    input: {
      emitter: context.token.id.toLowerCase(),
    },
    output: EventsResponseSchema,
  });

  return response;
});
