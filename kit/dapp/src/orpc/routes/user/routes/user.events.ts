import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserEventSchema } from "@/orpc/routes/user/routes/user.events.schema";
import { z } from "zod";

/**
 * GraphQL query for retrieving events where a user is involved.
 *
 * The 'involved' field captures ALL participants in an event, including:
 * - Sender (who initiated the transaction)
 * - Receiver (recipient of transfers, airdrops, etc.)
 * - Grantee (receiving roles, permissions)
 * - Any other address parameter in the event
 *
 * This ensures users see all events they're part of, not just those they initiated.
 *
 * Supports pagination via skip/first and ordering via orderBy/orderDirection.
 */
const USER_EVENTS_QUERY = theGraphGraphql(`
  query UserEventsQuery(
    $userAddress: String!
    $limit: Int!,
    $skip: Int!,
    $orderBy: Event_orderBy!,
    $orderDirection: OrderDirection!
  ) {
    events(
      where: { involved_contains: [$userAddress] }
      first: $limit
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
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
 * GraphQL query for getting total count of events for a user.
 *
 * Retrieves all events where the user is involved, used for pagination
 * calculations. The @fetchAll directive ensures we get accurate counts
 * even for users with many events beyond the default page limit.
 */
const USER_EVENTS_COUNT_QUERY = theGraphGraphql(`
  query UserEventsCountQuery($userAddress: String!) {
    events(
      where: { involved_contains: [$userAddress] }
    ) @fetchAll {
      id
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

    const userAddress = context.auth.user.wallet.toLowerCase();

    const [eventsResponse, countResponse] = await Promise.all([
      context.theGraphClient.query(USER_EVENTS_QUERY, {
        input: {
          userAddress,
          limit: input?.limit ?? 20,
          skip: input?.offset ?? 0,
          orderBy: input?.orderBy ?? "blockTimestamp",
          orderDirection: input?.orderDirection ?? "desc",
        },
        output: z.object({
          events: z.array(UserEventSchema),
        }),
      }),
      context.theGraphClient.query(USER_EVENTS_COUNT_QUERY, {
        input: { userAddress },
        output: z.object({ events: z.array(z.object({ id: z.string() })) }),
      }),
    ]);

    return {
      events: eventsResponse.events,
      total: countResponse.events.length,
    };
  }
);
