import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { approve } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { call } from "@orpc/server";
import * as z from "zod";

/**
 * Minimal GraphQL query to get only the denomination asset from a fixed yield schedule.
 *
 * This query is optimized to retrieve only the denomination asset address,
 * avoiding the overhead of fetching the complete yield schedule data.
 */
const GET_DENOMINATION_ASSET_QUERY = theGraphGraphql(`
  query GetDenominationAsset($id: ID!) {
    tokenFixedYieldSchedule(id: $id) {
      id
      denominationAsset {
        id
      }
    }
  }
`);

/**
 * Portal GraphQL mutation for topping up denomination asset in a fixed yield schedule.
 *
 * This mutation adds denomination assets to an existing fixed yield schedule contract
 * to ensure sufficient funds are available for yield payments.
 */
const TOP_UP_DENOMINATION_ASSET_MUTATION = portalGraphql(`
  mutation TopUpDenominationAsset(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
  ) {
    topUpDenominationAsset: ISMARTFixedYieldScheduleTopUpDenominationAsset(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Fixed yield schedule top up route handler.
 *
 * Tops up the denomination asset in an existing fixed yield schedule contract.
 * This endpoint handles adding funds to ensure the yield schedule has sufficient
 * denomination assets to make yield payments according to the configured schedule.
 *
 * The operation involves three steps:
 * 1. Retrieve the denomination asset address from the fixed yield schedule
 * 2. Approve the fixed yield schedule contract to spend the denomination asset
 * 3. Execute the top up transaction to transfer the approved amount
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires system access and appropriate addon permissions
 * Method: POST /fixed-yield-schedule/top-up
 *
 * @param input - Request parameters containing contract address and top up amount
 * @param context - Request context with Portal client and authenticated user
 * @returns Promise<{transactionHash: string}> - The transaction hash of the top up operation
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws NOT_FOUND - If system context, yield schedule, or denomination asset is missing
 * @throws INTERNAL_SERVER_ERROR - If approval or top up transaction fails
 *
 * @example
 * ```typescript
 * // Top up denomination asset in a fixed yield schedule
 * // This will first approve the amount and then execute the top up
 * const result = await orpc.fixedYieldSchedule.topUp.mutate({
 *   contract: "0xabc123...", // Fixed yield schedule contract address
 *   amount: "1000000", // Amount to top up (will be approved first)
 *   walletVerification: {
 *     secretVerificationCode: "123456",
 *     verificationType: "PINCODE"
 *   }
 * });
 *
 * console.log(result.transactionHash); // "0x123abc..."
 * ```
 *
 * @see {@link FixedYieldScheduleTopUpInputSchema} for input validation
 * @see {@link FixedYieldScheduleTopUpOutputSchema} for response structure
 * @see {@link approve} for the approval step
 */
export const topUp = systemRouter.fixedYieldSchedule.topUp.handler(
  async ({ input, context, errors }) => {
    const { contract, amount, walletVerification } = input;
    const { auth, system } = context;

    if (!system) {
      throw errors.NOT_FOUND({
        message: "System context is missing. Cannot top up yield schedule.",
      });
    }

    const sender = auth.user;

    // Step 1: Get the denomination asset address from the fixed yield schedule
    const scheduleData = await context.theGraphClient.query(
      GET_DENOMINATION_ASSET_QUERY,
      {
        input: { id: contract.toLowerCase() },
        output: z.object({
          tokenFixedYieldSchedule: z
            .object({
              id: ethereumAddress,
              denominationAsset: z.object({
                id: ethereumAddress,
              }),
            })
            .nullable(),
        }),
      }
    );

    if (!scheduleData.tokenFixedYieldSchedule) {
      throw errors.NOT_FOUND({
        message: "Fixed yield schedule not found.",
      });
    }

    const denominationAsset =
      scheduleData.tokenFixedYieldSchedule.denominationAsset.id;

    // Step 2: Approve the fixed yield schedule contract to spend the denomination asset
    await call(
      approve,
      {
        contract: denominationAsset,
        spender: contract,
        amount: amount,
        walletVerification,
      },
      {
        context,
      }
    );

    // Step 3: Execute the top up transaction
    const transactionHash = await context.portalClient.mutate(
      TOP_UP_DENOMINATION_ASSET_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        amount: amount.toString(),
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return {
      transactionHash,
    };
  }
);
