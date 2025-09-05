/**
 * Token Minting Handler for Supply Management
 *
 * @fileoverview
 * Implements secure token minting operations for authorized token issuers.
 * Supports both single and batch minting operations with automatic optimization
 * based on operation size. Critical for token supply management and distribution.
 *
 * @remarks
 * MINTING AUTHORITY:
 * - Only users with mint permissions can create new tokens
 * - Minting increases total token supply and recipient balances
 * - Compliance modules may restrict minting based on regulations
 * - Supply caps may limit total mintable amount
 *
 * BATCH OPTIMIZATION:
 * - Single recipient: Uses standard mint() function for gas efficiency
 * - Multiple recipients: Uses batchMint() for reduced transaction overhead
 * - Array validation ensures parameter consistency and prevents errors
 * - Sequential processing within single transaction for atomicity
 *
 * SECURITY BOUNDARIES:
 * - Permission validation prevents unauthorized token creation
 * - Wallet verification required for all minting operations
 * - Recipient validation ensures tokens are minted to valid addresses
 * - Amount validation prevents overflow and ensures positive values
 *
 * COMPLIANCE INTEGRATION:
 * - Minting may trigger compliance checks on recipients
 * - KYC/AML verification may be required before minting
 * - Supply cap enforcement through smart contract logic
 * - Audit trail maintained for regulatory compliance
 *
 * @see {@link validateBatchArrays} Batch parameter validation utilities
 * @see {@link tokenPermissionMiddleware} Permission validation for minting operations
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";

/**
 * GraphQL mutation for single-recipient token minting.
 *
 * @remarks
 * SINGLE MINT OPTIMIZATION: Uses the standard ERC-20 mint() function for
 * maximum gas efficiency when minting to a single recipient. This is the
 * most common minting scenario and provides the lowest transaction cost.
 *
 * MINT MECHANICS:
 * - Increases total supply by the minted amount
 * - Credits recipient balance with new tokens
 * - Emits Transfer event from zero address to recipient
 * - May trigger compliance checks on recipient address
 *
 * GAS EFFICIENCY: ~80k gas vs ~120k+ for batch operations with single recipient
 * SECURITY: Requires wallet verification and mint permissions
 *
 * @param address - Token contract address where tokens will be minted
 * @param from - Minter's wallet address (must have mint permissions)
 * @param to - Recipient address to receive the newly minted tokens
 * @param amount - Amount of tokens to mint (in token's smallest unit)
 * @param challengeId - Portal verification challenge ID (auto-injected)
 * @param challengeResponse - MFA challenge response (auto-injected)
 * @returns Object containing transaction hash for monitoring mint operation
 */
const TOKEN_SINGLE_MINT_MUTATION = portalGraphql(`
  mutation TokenMint(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    mint: IERC3643Mint(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _to: $to
        _amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for batch token minting to multiple recipients.
 *
 * @remarks
 * BATCH MINT OPTIMIZATION: Uses specialized batchMint() function to distribute
 * tokens to multiple recipients in a single transaction. Provides significant
 * gas savings compared to individual mint transactions.
 *
 * BATCH MECHANICS:
 * - Processes all recipients atomically (all succeed or all fail)
 * - Validates array lengths match before execution
 * - Increases total supply by sum of all amounts
 * - Credits each recipient with their respective amount
 *
 * GAS SCALING: Linear scaling with per-recipient savings vs individual transactions
 * ATOMICITY: All mints succeed together or transaction reverts entirely
 * SECURITY: Single verification covers entire batch operation
 *
 * @param address - Token contract address where tokens will be minted
 * @param from - Minter's wallet address (must have mint permissions)
 * @param toList - Array of recipient addresses to receive tokens
 * @param amounts - Array of amounts corresponding to each recipient
 * @param challengeId - Portal verification challenge ID (auto-injected)
 * @param challengeResponse - MFA challenge response (auto-injected)
 * @returns Object containing transaction hash for monitoring batch mint operation
 */
const TOKEN_BATCH_MINT_MUTATION = portalGraphql(`
  mutation TokenBatchMint(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $toList: [String!]!
    $amounts: [String!]!
  ) {
    batchMint: ISMARTBatchMint(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _toList: $toList
        _amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * ORPC handler for token minting with automatic batch optimization.
 *
 * @remarks
 * MINT AUTHORIZATION: Uses token permission middleware to verify the user
 * has mint permissions on the specified token contract. This prevents
 * unauthorized token creation and ensures proper supply management.
 *
 * OPERATION OPTIMIZATION: Automatically selects between single and batch
 * mint operations based on the number of recipients to minimize gas costs
 * and transaction complexity.
 *
 * MINTING WORKFLOW:
 * 1. Validate user has mint permissions on token contract
 * 2. Determine operation type (single vs batch) based on recipient count
 * 3. Validate batch parameters if applicable
 * 4. Execute wallet verification for the minting transaction
 * 5. Submit optimized mint transaction
 * 6. Wait for confirmation and return updated token data
 *
 * @param input - Minting parameters including recipients, amounts, and verification
 * @param context - ORPC context with authenticated user and Portal client
 * @param errors - Standardized error constructors for validation failures
 * @returns Updated token data including new supply and balance information
 * @throws UNAUTHORIZED When user lacks mint permissions on token
 * @throws INPUT_VALIDATION_FAILED When batch arrays are mismatched or invalid
 * @throws PORTAL_ERROR When minting transaction fails or verification is invalid
 */
export const mint = tokenRouter.token.mint
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.mint,
    })
  )
  .handler(async ({ input, context, errors }) => {
    // INPUT EXTRACTION: Destructure minting parameters from validated input
    // WHY: Type-safe extraction ensures all required parameters are present
    // Recipients and amounts arrays enable both single and batch operations
    const { contract, walletVerification, recipients, amounts } = input;
    const { auth } = context;

    // OPERATION CLASSIFICATION: Determine optimal minting strategy
    // WHY: Single operations use different GraphQL mutations for gas efficiency
    // Batch operations require array validation and different contract methods
    const isBatch = recipients.length > 1;

    // AUTHENTICATED MINTER: Extract user information for transaction authorization
    // WHY: Only authorized minters can create new tokens and increase supply
    // Permission middleware validates mint authority before execution
    const sender = auth.user;
    // MINT EXECUTION: Choose optimal operation type based on recipient count
    // WHY: Different mutation types have different gas costs and complexity
    // This selection ensures minimal transaction costs for each scenario
    if (isBatch) {
      // BATCH VALIDATION: Ensure array parameters are consistent and valid
      // WHY: Mismatched array lengths would cause transaction reversion
      // Early validation provides better error messages than blockchain errors
      validateBatchArrays(
        {
          recipients,
          amounts,
        },
        "batch mint"
      );

      // BATCH MINT EXECUTION: Submit batch minting transaction
      // WHY: Single transaction for multiple recipients provides gas efficiency
      // Amount conversion to string matches GraphQL BigInt scalar requirements

      await context.portalClient.mutate(
        TOKEN_BATCH_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          toList: recipients,
          amounts: amounts.map((a) => a.toString()),
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      // SINGLE MINT PREPARATION: Extract single recipient and amount
      // WHY: Single mint operations use simpler parameter structure
      // Array destructuring provides type-safe access to first elements
      const [to] = recipients;
      const [amount] = amounts;

      // PARAMETER VALIDATION: Ensure required values are present
      // WHY: TypeScript can't guarantee array elements exist at runtime
      // Explicit validation prevents undefined parameter errors
      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      // SINGLE MINT EXECUTION: Submit optimized single minting transaction
      // WHY: Single-recipient mutations have lower gas costs than batch operations
      // Portal client handles verification and transaction tracking automatically
      await context.portalClient.mutate(
        TOKEN_SINGLE_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          to,
          amount: amount.toString(),
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    }

    // UPDATED TOKEN DATA: Return fresh token information including new supply
    // WHY: Client needs updated supply and balance information for UI display
    // Portal middleware ensures transaction is confirmed and indexed before data refresh
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
