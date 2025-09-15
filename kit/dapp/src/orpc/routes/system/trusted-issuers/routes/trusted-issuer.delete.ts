/**
 * Trusted Issuer Deletion Handler
 *
 * This handler deletes trusted issuers from the ATKTrustedIssuersRegistry contract.
 * Once deleted, the issuer can no longer verify claims for any topics in the system.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Executes the deletion transaction via Portal GraphQL
 * 3. Returns transaction details and the deleted issuer address
 *
 * @see {@link ./trusted-issuer.delete.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  TrustedIssuerDeleteOutputSchema,
  type TrustedIssuerDeleteOutput,
} from "./trusted-issuer.delete.schema";

/**
 * GraphQL mutation for removing a trusted issuer
 * Calls the removeTrustedIssuer function on the ATKTrustedIssuersRegistry contract
 */
const REMOVE_TRUSTED_ISSUER_MUTATION = portalGraphql(`
  mutation RemoveTrustedIssuerMutation(
    $address: String!
    $from: String!
    $trustedIssuer: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTrustedIssuersRegistryRemoveTrustedIssuer(
      address: $address
      from: $from
      input: {
        trustedIssuer: $trustedIssuer
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Delete a trusted issuer from the registry
 *
 * Permanently deletes a trusted issuer, revoking their ability to verify any claims.
 * This action cannot be undone - the issuer would need to be re-added if needed again.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The deletion parameters
 * @param input.issuerAddress - Address of the issuer to delete
 * @returns Transaction hash and deleted issuer address
 */
export const trustedIssuerDelete = systemRouter.system.trustedIssuers.delete
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.trustedIssuerDelete,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context }): Promise<TrustedIssuerDeleteOutput> => {
    const { system } = context;
    const { issuerAddress, walletVerification } = input;
    const sender = context.auth.user;

    const registryAddress = system.trustedIssuersRegistry.id;

    // Execute the deletion transaction
    const transactionHash = await context.portalClient.mutate(
      REMOVE_TRUSTED_ISSUER_MUTATION,
      {
        address: registryAddress,
        from: sender.wallet,
        trustedIssuer: issuerAddress,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return success response with transaction details
    return TrustedIssuerDeleteOutputSchema.parse({
      transactionHash,
      issuerAddress,
    });
  });
