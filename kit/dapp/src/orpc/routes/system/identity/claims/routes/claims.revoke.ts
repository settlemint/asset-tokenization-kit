// Revoke flow handled via helper
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { revokeClaim } from "@/orpc/helpers/claims/revoke-claim";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { fetchClaimByTopicAndIdentity } from "@/orpc/routes/user/utils/identity.util";
import { encodeAbiParameters, getAddress, keccak256 } from "viem";
import * as z from "zod";

// GraphQL query to check if a user has management key on an identity
const CHECK_MANAGEMENT_KEY_QUERY = theGraphGraphql(`
  query CheckManagementKey($identityAddress: Bytes!, $keyHash: Bytes!) {
    identityKeys(
      where: {
        identity_: { id: $identityAddress },
        key: $keyHash,
        purpose: "management"
      }
    ) {
      id
      purpose
    }
  }
`);

const ManagementKeyResponseSchema = z.object({
  identityKeys: z.array(
    z.object({
      id: z.string(),
      purpose: z.string(),
    })
  ),
});

/**
 * Claims revoke route handler.
 *
 * Revokes an existing claim from an on-chain identity. This endpoint enforces
 * the same authorization as the smart contract's `revokeClaim` function, which
 * requires the caller to have a MANAGEMENT_KEY on the target identity.
 *
 * **Authorization Model:**
 * - Only users with MANAGEMENT_KEY can revoke claims on an identity
 * - Identity owners automatically have MANAGEMENT_KEY when their identity is created
 * - Additional MANAGEMENT_KEYs can be granted by existing managers
 * - The key is checked via The Graph indexer for efficient verification
 *
 * **Key Requirements:**
 * - ✅ Target identity must exist
 * - ✅ Revoker must provide valid wallet verification
 * - ✅ Claim must exist on the target identity
 * - ✅ Revoker's wallet must have MANAGEMENT_KEY (purpose = 1) on the target identity
 *
 * **Smart Contract Alignment:**
 * This endpoint mirrors the `onlyManager` modifier in ATKIdentityImplementation.sol,
 * which checks: keyHasPurpose(keccak256(abi.encode(_msgSender())), MANAGEMENT_KEY)
 *
 * **Blockchain Interaction:**
 * - Queries The Graph to verify MANAGEMENT_KEY ownership
 * - Calls identity contract's `revokeClaim` function
 * - Transaction is executed on-chain and indexed
 * - Claim is permanently removed from the identity
 *
 * Authentication: Required (uses authenticated router)
 * Method: POST /system/identity/claims/revoke
 *
 * @param input - Revoke parameters with target identity address, claim topic, and wallet verification
 * @param context - Request context with authenticated user, TheGraph client, and portal client
 * @returns Promise<ClaimsRevokeOutput> - Success status, transaction hash, and revoked claim ID
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user's wallet lacks MANAGEMENT_KEY on the target identity
 * @throws NOT_FOUND - If target identity or specified claim is not found
 * @throws BAD_REQUEST - If claim doesn't exist or revocation parameters are invalid
 * @throws INTERNAL_SERVER_ERROR - If The Graph client is unavailable or blockchain interaction fails
 *
 * @example
 * ```typescript
 * // Identity owner revoking their own KYC claim
 * const result = await orpc.system.identity.claims.revoke.mutate({
 *   targetIdentityAddress: "0x1234567890123456789012345678901234567890",
 *   claimTopic: "knowYourCustomer",
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Manager with MANAGEMENT_KEY revoking a claim on managed identity
 * const result = await orpc.system.identity.claims.revoke.mutate({
 *   targetIdentityAddress: "0x9876543210987654321098765432109876543210",
 *   claimTopic: "collateral",
 *   walletVerification: {
 *     verificationType: "otp",
 *     secretVerificationCode: "123456"
 *   }
 * });
 * ```
 *
 * @remarks
 * - Revocation is permanent and cannot be undone
 * - The revoker must have been explicitly granted MANAGEMENT_KEY on the identity
 * - Claims are immediately removed from the identity and reflected in The Graph
 * - This replaces the previous trusted issuer authorization model
 */
export const revoke = authRouter.system.identity.claims.revoke
  .use(theGraphMiddleware)
  .use(systemMiddleware)
  .use(portalMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { claimTopic, walletVerification, targetIdentityAddress } = input;

    if (!context.theGraphClient) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "The Graph client is unavailable",
      });
    }

    const targetIdentityChecksummed = getAddress(targetIdentityAddress);
    const userWallet = getAddress(context.auth.user.wallet);

    // Create a key hash from the user's wallet address (same as in the smart contract)
    const keyHash = keccak256(
      encodeAbiParameters(
        [
          {
            name: "wallet",
            type: "address",
          },
        ],
        [userWallet]
      )
    );

    // Check if the user has MANAGEMENT_KEY on the target identity using The Graph
    const { identityKeys } = await context.theGraphClient.query(
      CHECK_MANAGEMENT_KEY_QUERY,
      {
        input: {
          identityAddress: targetIdentityChecksummed.toLowerCase(),
          keyHash: keyHash.toLowerCase(),
        },
        output: ManagementKeyResponseSchema,
      }
    );

    const hasManagementKey = identityKeys.length > 0;

    if (!hasManagementKey) {
      throw errors.FORBIDDEN({
        message:
          "You do not have a MANAGEMENT_KEY on this identity. Only users with management rights can revoke claims.",
      });
    }

    // User has management key, proceed with revocation
    const issuerIdentity = context.system?.userIdentity?.address
      ? getAddress(context.system.userIdentity.address)
      : userWallet;

    // Fetch the claim by topic and identity; let utility surface standardized ORPC errors
    const { extractedClaimId } = await fetchClaimByTopicAndIdentity({
      claimTopic,
      identityAddress: targetIdentityChecksummed,
      context,
      errors,
    });

    // Submit claim revocation via helper
    const result = await revokeClaim({
      user: context.auth.user,
      issuer: issuerIdentity,
      walletVerification,
      identity: targetIdentityChecksummed,
      claimId: extractedClaimId,
      portalClient: context.portalClient,
    });

    return {
      success: true,
      transactionHash: result,
      claimId: extractedClaimId,
    };
  });
