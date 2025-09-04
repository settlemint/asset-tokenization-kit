import { TokenFixedYieldScheduleFragment } from "@/lib/fragments/the-graph/fixed-yield-schedule-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { FixedYieldScheduleSchema } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.read.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { bigDecimal } from "@atk/zod/src/bigdecimal";
import { from } from "dnum";
import { z } from "zod";

/**
 * GraphQL query for retrieving a specific fixed yield schedule from TheGraph.
 *
 * This query fetches comprehensive yield schedule data including configuration,
 * yield tracking, period management, and denomination asset details. It uses
 * the TokenFixedYieldScheduleFragment to ensure consistent data structure
 * and type safety across the application.
 *
 * The query retrieves:
 * - Schedule configuration (start/end dates, rate, interval)
 * - Yield tracking (total claimed, unclaimed, and total yield)
 * - Denomination asset reference
 * - Period management (current, next, and all periods)
 *
 * @param id - The fixed yield schedule contract address to query
 */
const READ_FIXED_YIELD_SCHEDULE_QUERY = theGraphGraphql(
  `
  query ReadFixedYieldScheduleQuery($id: ID!, $account: String!) {
    tokenFixedYieldSchedule(id: $id) {
      ...TokenFixedYieldScheduleFragment
      denominationAsset {
        id
        balance: balances(where: {account: $account}) {
          available
        }
      }
    }
  }
`,
  [TokenFixedYieldScheduleFragment]
);

/**
 * Fixed yield schedule read route handler.
 *
 * Retrieves detailed information about a specific fixed yield schedule
 * by its contract address. This endpoint provides comprehensive access
 * to yield schedule data including configuration, tracking metrics,
 * and period details for client applications.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on fixed yield schedules
 * Method: GET /fixed-yield-schedule/{id}
 *
 * @param input - Request parameters containing the yield schedule ID
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<FixedYieldSchedule> - Complete yield schedule data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws NOT_FOUND - If yield schedule with given ID does not exist
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get fixed yield schedule details
 * const schedule = await orpc.fixedYieldSchedule.read.query({
 *   id: "0x1234567890abcdef1234567890abcdef12345678"
 * });
 *
 * console.log(schedule.rate); // "500" (5% in basis points)
 * console.log(schedule.totalYield); // [BigInt, number] (Dnum format)
 * console.log(schedule.currentPeriod?.id); // Current period ID or null
 * ```
 *
 * @see {@link FixedYieldScheduleSchema} for the response structure
 * @see {@link FixedYieldScheduleReadInputSchema} for input validation
 */
export const read = authRouter.fixedYieldSchedule.read.handler(
  async ({ input, context, errors }) => {
    const response = await context.theGraphClient.query(
      READ_FIXED_YIELD_SCHEDULE_QUERY,
      {
        input: {
          id: input.id,
          account: input.id,
        },
        output: z.object({
          tokenFixedYieldSchedule: FixedYieldScheduleSchema.extend({
            denominationAsset: z.object({
              id: ethereumAddress,
              balance: z
                .array(
                  z.object({
                    available: bigDecimal().describe(
                      "Available balance of the denomination asset"
                    ),
                  })
                )
                .describe("Array of balance objects for the denomination asset")
                .transform((val) => val?.[0]?.available ?? from(0)),
            }),
          }).nullable(),
        }),
      }
    );

    if (!response.tokenFixedYieldSchedule) {
      throw errors.NOT_FOUND({
        message: `Fixed yield schedule not found for address ${input.id}`,
      });
    }

    return response.tokenFixedYieldSchedule;
  }
);
