/**
 * Token Burn Mutation with Wallet Verification
 *
 * @remarks
 * This mutation demonstrates the new wallet verification pattern where verification
 * parameters are optional at the GraphQL level but enriched by the Portal middleware.
 * The mutation supports both single and batch burn operations with automatic verification
 * handling based on user settings.
 *
 * VERIFICATION FLOW:
 * 1. Mutation receives walletVerification object from input schema
 * 2. Portal middleware enriches GraphQL variables with challengeId and challengeResponse
 * 3. Portal validates the verification before executing the burn operation
 *
 * SECURITY RATIONALE:
 * - Burn operations are destructive and require strong authentication
 * - Verification type (OTP/PINCODE/SECRET_CODES) is determined by user configuration
 * - Challenge response is generated securely based on verification type
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Batch operations reduce transaction overhead for multiple burns
 * - Verification adds latency but is essential for security
 * - Array validation prevents malformed batch requests
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_SINGLE_BURN_MUTATION = portalGraphql(`
  mutation TokenBurn(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $amount: String!
  ) {
    burn: IERC3643Burn(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _userAddress: $userAddress
        _amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_BURN_MUTATION = portalGraphql(`
  mutation TokenBatchBurn(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddresses: [String!]!
    $amounts: [String!]!
  ) {
    batchBurn: ISMARTBurnableBatchBurn(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        userAddresses: $userAddresses
        amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const burn = tokenRouter.token.burn
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.burn,
      requiredExtensions: ["BURNABLE"],
    })
  )

  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification, addresses, amounts } = input;
    const { auth } = context;

    // OPERATION STRATEGY: Determine batch vs single operation to optimize gas costs
    const isBatch = addresses.length > 1;

    const sender = auth.user;
    // VERIFICATION PATTERN: walletVerification contains user verification settings
    // Portal middleware will enrich GraphQL variables with challengeId and challengeResponse
    if (isBatch) {
      // Validate batch arrays
      validateBatchArrays(
        {
          addresses,
          amounts,
        },
        "batch burn"
      );

      // BATCH BURN: Multiple addresses in single transaction to reduce gas costs
      await context.portalClient.mutate(
        TOKEN_BATCH_BURN_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          userAddresses: addresses,
          amounts: amounts.map((a) => a.toString()),
        },
        {
          // VERIFICATION DELEGATION: Portal middleware handles verification enrichment
          // - Gets challengeId from sender based on verificationType
          // - Generates challengeResponse using appropriate algorithm
          // - Adds both to GraphQL variables before mutation execution
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      const [userAddress] = addresses;
      const [amount] = amounts;
      if (!userAddress || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing address or amount",
          data: { errors: ["Invalid input data"] },
        });
      }
      // SINGLE BURN: Standard ERC3643 burn operation with verification
      await context.portalClient.mutate(
        TOKEN_SINGLE_BURN_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          userAddress,
          amount: amount.toString(),
        },
        {
          // SAME VERIFICATION PATTERN: Middleware enrichment works for all mutation types
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    }

    // Return the updated token data using the read handler
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
