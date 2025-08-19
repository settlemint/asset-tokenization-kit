/**
 * Token Approval Handler for ERC-20 Allowance Management
 *
 * @fileoverview
 * Implements secure token approval operations following the ERC-20 standard allowance pattern.
 * Enables token holders to authorize third parties (spenders) to transfer tokens on their behalf
 * within specified limits. Critical for DeFi integrations and automated token operations.
 *
 * @remarks
 * ALLOWANCE SECURITY PATTERN:
 * - Follows ERC-20 approve() standard for third-party authorization
 * - Requires token holder permission verification before approval
 * - Amount limits prevent unlimited token access by spenders
 * - Approval can be revoked by setting amount to zero
 *
 * SECURITY BOUNDARIES:
 * - Only token holders can approve spending of their tokens
 * - Wallet verification required to prevent unauthorized approvals
 * - Permission middleware validates user has approve rights on token
 * - Spender address validation prevents approval to invalid addresses
 *
 * USE CASES:
 * - DeFi protocol integrations (DEX, lending, yield farming)
 * - Automated payment systems and subscription services
 * - Escrow and custody service integrations
 * - Multi-signature wallet and delegation patterns
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Approval transaction: ~50k gas for standard ERC-20 implementation
 * - Verification overhead: ~200ms for wallet verification
 * - State update: Immediate allowance mapping update on blockchain
 * - Integration latency: ~2-3 seconds for indexing and UI refresh
 *
 * @see {@link tokenPermissionMiddleware} Permission validation for token operations
 * @see {@link read} Token data refresh after approval operation
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

/**
 * GraphQL mutation for ERC-20 token approval operation.
 *
 * @remarks
 * ERC-20 STANDARD: Implements the standard approve() function allowing a spender
 * to withdraw from the token holder's account multiple times up to the approved amount.
 *
 * ALLOWANCE MECHANICS:
 * - Sets or updates the allowance mapping for [owner][spender] = amount
 * - Previous allowance is overwritten (not additive)
 * - Zero amount effectively revokes the approval
 * - Spender can transfer up to the approved amount until explicitly revoked
 *
 * SECURITY CONSIDERATIONS:
 * - Race condition: Approve to zero before setting new amount for security
 * - Infinite approval: Use max uint256 for unlimited allowance (use with caution)
 * - Verification required: Portal middleware ensures legitimate token holder approval
 *
 * @param address - Token contract address to approve spending from
 * @param from - Token holder's wallet address (must own tokens being approved)
 * @param spender - Address authorized to spend tokens on behalf of holder
 * @param amount - Maximum amount the spender is authorized to transfer
 * @param challengeId - Portal verification challenge ID (auto-injected)
 * @param challengeResponse - MFA challenge response (auto-injected)
 * @returns Object containing transaction hash for monitoring approval
 */
const TOKEN_APPROVE_MUTATION = portalGraphql(`
  mutation TokenApprove(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $spender: String!
    $amount: String!
  ) {
    approve: SMARTApprove(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        spender: $spender
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * ORPC handler for token approval with permission validation and state refresh.
 *
 * @remarks
 * PERMISSION VALIDATION: Uses token permission middleware to verify the user
 * has appropriate rights to approve spending of the specified token. This prevents
 * unauthorized approvals and ensures proper access control.
 *
 * APPROVAL WORKFLOW:
 * 1. Validate user has approve permissions on the token contract
 * 2. Execute wallet verification for the approval transaction
 * 3. Submit approval transaction with spender and amount parameters
 * 4. Wait for transaction confirmation and indexing
 * 5. Return refreshed token data including updated allowance information
 *
 * STATE CONSISTENCY: Returns updated token data after approval to ensure
 * client has latest allowance information for UI updates and subsequent operations.
 *
 * @param input - Approval parameters including contract, spender, amount, and verification
 * @param context - ORPC context with authenticated user and Portal client
 * @returns Updated token data including new allowance mapping
 * @throws UNAUTHORIZED When user lacks approve permissions on token
 * @throws PORTAL_ERROR When approval transaction fails or verification is invalid
 */
export const approve = tokenRouter.token.approve
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.approve,
    })
  )

  .handler(async ({ input, context }) => {
    // INPUT EXTRACTION: Destructure approval parameters from validated input
    // WHY: Type-safe extraction ensures all required parameters are present
    // Portal middleware will validate wallet verification parameters
    const { contract, walletVerification, spender, amount } = input;
    const { auth } = context;

    // AUTHENTICATED USER: Extract user information for transaction authorization
    // WHY: Token approvals must be signed by the actual token holder
    // This ensures the approval comes from the legitimate token owner
    const sender = auth.user;
    // APPROVAL EXECUTION: Submit token approval transaction with verification
    // WHY: Portal client handles transaction tracking and verification automatically
    // Amount converted to string to match GraphQL BigInt scalar requirements
    await context.portalClient.mutate(
      TOKEN_APPROVE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        spender,
        amount: amount.toString(),
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // UPDATED TOKEN DATA: Return fresh token information including new allowance
    // WHY: Client needs updated allowance information for UI display and validation
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
