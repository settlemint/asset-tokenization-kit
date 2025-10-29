import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

/**
 * Portal GraphQL mutation for withdrawing denomination asset from a fixed yield schedule.
 *
 * This mutation withdraws denomination assets from an existing fixed yield schedule contract
 * to a specified recipient address.
 */
const WITHDRAW_DENOMINATION_ASSET_MUTATION = portalGraphql(`
  mutation WithdrawDenominationAsset(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
    $to: String!
  ) {
    withdrawDenominationAsset: ISMARTFixedYieldScheduleWithdrawDenominationAsset(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        amount: $amount
        to: $to
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Fixed yield schedule withdraw route handler.
 *
 * Withdraws the denomination asset from an existing fixed yield schedule contract.
 * This endpoint handles withdrawing funds from the yield schedule to a specified
 * recipient address.
 *
 * The operation executes a single transaction to withdraw the specified amount
 * of denomination asset from the fixed yield schedule contract to the recipient.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires system access and appropriate addon permissions
 * Method: POST /fixed-yield-schedule/withdraw
 *
 * @param input - Request parameters containing contract address, amount, and recipient
 * @param context - Request context with Portal client and authenticated user
 * @returns Promise<{transactionHash: string}> - The transaction hash of the withdraw operation
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws NOT_FOUND - If system context is missing
 * @throws INTERNAL_SERVER_ERROR - If withdraw transaction fails
 *
 * @example
 * ```typescript
 * // Withdraw denomination asset from a fixed yield schedule
 * const result = await orpc.fixedYieldSchedule.withdraw.mutate({
 *   contract: "0xabc123...", // Fixed yield schedule contract address
 *   amount: "1000000", // Amount to withdraw
 *   to: "0xdef456...", // Recipient address
 *   walletVerification: {
 *     secretVerificationCode: "123456",
 *     verificationType: "PINCODE"
 *   }
 * });
 *
 * console.log(result.transactionHash); // "0x123abc..."
 * ```
 *
 * @see {@link FixedYieldScheduleWithdrawInputSchema} for input validation
 * @see {@link FixedYieldScheduleWithdrawOutputSchema} for response structure
 */
export const withdraw = tokenRouter.fixedYieldSchedule.withdraw
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.withdrawDenominationAsset,
      requiredExtensions: ["YIELD"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { amount, to, contract, walletVerification } = input;
    const { auth, system } = context;

    if (!system) {
      throw errors.NOT_FOUND({
        message:
          "System context is missing. Cannot withdraw from yield schedule.",
      });
    }

    const sender = auth.user;

    // Execute the withdraw transaction
    const txHash = await context.portalClient.mutate(
      WITHDRAW_DENOMINATION_ASSET_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        amount: amount.toString(),
        to: to,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return {
      txHash,
    };
  });
