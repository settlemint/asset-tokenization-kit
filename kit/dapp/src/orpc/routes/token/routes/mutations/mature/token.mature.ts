/**
 * Token Bond Maturity Handler
 *
 * @fileoverview
 * Implements the bond maturity process for tokenized bonds.
 * Marks bonds as matured after validating maturity conditions including
 * date requirements and denomination asset balances.
 *
 * @remarks
 * MATURITY REQUIREMENTS:
 * - Bond must have reached its maturity date (current time >= maturityDate)
 * - Bond must not already be matured
 * - Contract must hold sufficient denomination assets for all redemptions
 * - Only addresses with GOVERNANCE_ROLE can trigger maturity
 *
 * MATURITY PROCESS:
 * - Validates bond is eligible for maturity
 * - Checks denomination asset balance meets requirements
 * - Sets bond isMatured flag to true
 * - Emits BondMatured event for tracking
 *
 * SECURITY BOUNDARIES:
 * - Governance role required to prevent unauthorized maturity
 * - Timestamp validation prevents premature maturity
 * - Balance validation ensures redemption capability
 * - Idempotency check prevents double maturity
 *
 * POST-MATURITY EFFECTS:
 * - Bond holders can redeem tokens for denomination assets
 * - No new transfers are allowed (bond becomes frozen)
 * - Bond enters final settlement phase
 *
 * @see {@link tokenPermissionMiddleware} Governance role validation
 * @see {@link ATKBondImplementation} Smart contract maturity logic
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { holder } from "@/orpc/routes/token/routes/token.holder";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { isBefore } from "date-fns";
import { from, lessThan } from "dnum";

/**
 * GraphQL mutation for bond maturity.
 *
 * @remarks
 * MATURITY MECHANICS:
 * - Validates maturity date has been reached
 * - Checks denomination asset balance sufficiency
 * - Sets isMatured flag permanently
 * - Emits BondMatured event with timestamp
 *
 * VALIDATION SEQUENCE:
 * 1. Current timestamp must be >= maturity date
 * 2. Bond must not already be matured
 * 3. Denomination asset balance must cover all potential redemptions
 * 4. Caller must have GOVERNANCE_ROLE
 *
 * GAS EFFICIENCY: ~100k gas for maturity transaction
 * SECURITY: Multiple validation layers prevent premature or duplicate maturity
 *
 * @param address - Bond token contract address
 * @param from - Governance address triggering maturity
 * @param challengeId - Portal verification challenge ID (auto-injected)
 * @param challengeResponse - MFA challenge response (auto-injected)
 * @returns Object containing transaction hash for monitoring maturity operation
 */
const TOKEN_MATURE_MUTATION = portalGraphql(`
  mutation TokenMature(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    mature: ATKBondImplementationMature(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * ORPC handler for bond token maturity.
 *
 * @remarks
 * MATURITY AUTHORIZATION: Uses token permission middleware to verify the user
 * has governance permissions on the bond contract. This prevents unauthorized
 * maturity operations and ensures proper protocol governance.
 *
 * BOND VALIDATION: Automatically validates that the token has the BOND extension
 * and is eligible for maturity operations. Non-bond tokens will be rejected.
 *
 * MATURITY WORKFLOW:
 * 1. Validate user has governance permissions on bond
 * 2. Check bond has BOND extension
 * 3. Verify maturity date has been reached
 * 4. Confirm denomination asset balance is sufficient
 * 5. Execute wallet verification for maturity transaction
 * 6. Submit maturity transaction to blockchain
 * 7. Wait for confirmation and return updated bond data
 *
 * @param input - Maturity parameters including contract and verification
 * @param context - ORPC context with authenticated user, Portal client, and token data
 * @param errors - Standardized error constructors for validation failures
 * @returns Updated bond data including maturity status and denomination asset details
 * @throws UNAUTHORIZED When user lacks governance permissions on bond
 * @throws INPUT_VALIDATION_FAILED When bond conditions don't meet maturity requirements
 * @throws PORTAL_ERROR When maturity transaction fails or verification is invalid
 */
export const mature = tokenRouter.token.mature
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.mature,
      requiredExtensions: ["BOND"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification } = input;
    const { auth, token } = context;

    if (!token.bond) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Token is not a bond",
        data: { errors: ["Only bond tokens can be matured"] },
      });
    }

    if (token.bond.isMatured) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Bond is already matured",
        data: { errors: ["This bond has already been matured"] },
      });
    }

    if (isBefore(new Date(), token.bond.maturityDate)) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Bond has not reached maturity date",
        data: {
          errors: [
            `Bond cannot be matured until ${token.bond.maturityDate.toISOString()}`,
          ],
        },
      });
    }

    const denominationAssetBalance = await call(
      holder,
      {
        tokenAddress: contract,
        holderAddress: token.id,
      },
      {
        context,
      }
    );

    const denominationAssetAmount =
      denominationAssetBalance.holder?.available ?? from(0);
    const requiredAmount = token.bond.denominationAssetMaturityAmount;

    if (lessThan(denominationAssetAmount, requiredAmount)) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Insufficient denomination asset balance",
        data: {
          errors: [
            `Bond contract needs ${requiredAmount} denomination assets but only has ${denominationAssetAmount}`,
          ],
        },
      });
    }

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_MATURE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

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
