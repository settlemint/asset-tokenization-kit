import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserEventsResponseSchema } from "@/orpc/routes/user/routes/user.events.schema";

/**
 * GraphQL query for retrieving recent events where a user is involved.
 *
 * The 'involved' field captures ALL participants in an event, including:
 * - Sender (who initiated the transaction)
 * - Receiver (recipient of transfers, airdrops, etc.)
 * - Grantee (receiving roles, permissions)
 * - Any other address parameter in the event
 *
 * This ensures users see all events they're part of, not just those they initiated.
 */
const USER_EVENTS_QUERY = theGraphGraphql(`
  query UserRecentEventsQuery($userAddress: String!, $limit: Int = 5) {
    events(
      where: { involved_contains: [$userAddress] }
      first: $limit
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
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
      involved {
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
 * User recent events route handler.
 *
 * Retrieves the most recent blockchain events where the authenticated user
 * is involved in any capacity. This provides a comprehensive activity feed
 * for the dashboard showing all user interactions with the platform.
 *
 * Authentication: Required
 * Method: GET /user/events
 *
 * @param context - Request context with auth and TheGraph client
 * @param input - Optional limit for number of events to return (default: 5)
 * @returns Promise<UserEventsResponse> - Array of recent event objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get 5 most recent events for logged-in user
 * const response = await orpc.user.events.query();
 *
 * // Get 10 most recent events
 * const response = await orpc.user.events.query({ limit: 10 });
 * ```
 */
export const events = authRouter.user.events.handler(
  async ({ context, input }) => {
    if (!context.auth?.user.wallet) {
      throw new Error("User wallet address not found");
    }

    const response = await context.theGraphClient.query(USER_EVENTS_QUERY, {
      input: {
        userAddress: context.auth.user.wallet.toLowerCase(),
        limit: input?.limit ?? 5,
      },
      output: UserEventsResponseSchema,
    });

    return response;
  }
);
