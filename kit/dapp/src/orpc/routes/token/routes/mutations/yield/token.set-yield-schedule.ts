import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

/**
 * Portal GraphQL mutation for setting a yield schedule on a token.
 *
 * This mutation associates an existing fixed yield schedule contract
 * with a token contract, enabling yield-bearing functionality for the token.
 * The yield schedule must already exist and be deployed.
 */
const TOKEN_SET_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation TokenSetYieldSchedule(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $schedule: String!
  ) {
    setYieldSchedule: ISMARTYieldSetYieldSchedule(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        schedule: $schedule
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Token set yield schedule route handler.
 *
 * Associates an existing fixed yield schedule contract with a token,
 * enabling yield-bearing functionality. This endpoint only handles the
 * association operation - the yield schedule must already exist and be
 * created through the fixed yield schedule create endpoint.
 *
 * Authentication: Required (uses token router with permissions middleware)
 * Permissions: Requires "setYieldSchedule" permission and "YIELD" extension
 * Method: PUT /token/{tokenAddress}/yield-schedule
 *
 * @param input - Request parameters containing token and yield schedule addresses
 * @param context - Request context with Portal client and authenticated user
 * @returns Promise<Token> - Updated token object with yield schedule association
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required permissions or token doesn't support yield
 * @throws INTERNAL_SERVER_ERROR - If Portal mutation fails
 *
 * @example
 * ```typescript
 * // First create a yield schedule
 * const schedule = await orpc.fixedYieldSchedule.create.mutate({
 *   yieldRate: "500", // 5%
 *   paymentInterval: "86400", // Daily
 *   startTime: "1690876800",
 *   endTime: "1722499200",
 *   token: tokenAddress,
 *   countryCode: 840,
 *   walletVerification: { ... }
 * });
 *
 * // Then set it on the token
 * const updatedToken = await orpc.token.setYieldSchedule.mutate({
 *   contract: tokenAddress,
 *   schedule: schedule.address,
 *   walletVerification: { ... }
 * });
 * ```
 *
 * @see {@link TokenSetYieldScheduleInputSchema} for input validation
 */
export const setYieldSchedule = tokenRouter.token.setYieldSchedule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.setYieldSchedule,
      requiredExtensions: ["YIELD"],
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, schedule, walletVerification } = input;
    const { auth } = context;

    const sender = auth.user;

    await context.portalClient.mutate(
      TOKEN_SET_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        schedule,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
