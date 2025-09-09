/**
 * Trusted Issuer Update Handler
 *
 * This handler updates the claim topics for existing trusted issuers through
 * the ATKTrustedIssuersRegistry contract. This allows administrators to modify
 * which types of claims a trusted issuer is authorized to verify.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Executes the update transaction via Portal GraphQL
 * 3. Returns transaction details and the issuer address
 *
 * @see {@link ./trusted-issuer.update.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  TrustedIssuerUpdateOutputSchema,
  type TrustedIssuerUpdateOutput,
} from "./trusted-issuer.update.schema";

/**
 * GraphQL mutation for updating a trusted issuer's claim topics
 * Calls the updateIssuerClaimTopics function on the ATKTrustedIssuersRegistry contract
 */
const UPDATE_ISSUER_TOPICS_MUTATION = portalGraphql(`
  mutation UpdateIssuerTopicsMutation(
    $address: String!
    $from: String!
    $trustedIssuer: String!
    $claimTopics: [String!]!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTrustedIssuersRegistryUpdateIssuerClaimTopics(
      address: $address
      from: $from
      input: {
        trustedIssuer: $trustedIssuer
        newClaimTopics: $claimTopics
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Update the claim topics for a trusted issuer
 *
 * Modifies which claim topics a trusted issuer is authorized to verify.
 * The issuer must already be registered in the system.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The update parameters
 * @param input.issuerAddress - Address of the issuer to update
 * @param input.claimTopicIds - New array of topic IDs the issuer can verify
 * @returns Transaction hash and issuer address
 */
export const trustedIssuerUpdate = systemRouter.system.trustedIssuers.update
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.trustedIssuerUpdate,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(
    async ({ input, context, errors }): Promise<TrustedIssuerUpdateOutput> => {
      const { system } = context;
      const { issuerAddress, claimTopicIds, walletVerification } = input;
      const sender = context.auth.user;

      // Validate system configuration
      const registryAddress = system?.trustedIssuersRegistry;
      if (!registryAddress) {
        const cause = new Error(
          "Trusted issuers registry not found in system configuration"
        );
        throw errors.INTERNAL_SERVER_ERROR({
          message: cause.message,
          cause,
        });
      }

      // Execute the update transaction
      const transactionHash = await context.portalClient.mutate(
        UPDATE_ISSUER_TOPICS_MUTATION,
        {
          address: registryAddress,
          from: sender.wallet,
          trustedIssuer: issuerAddress,
          claimTopics: claimTopicIds,
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );

      // Return success response with transaction details
      return TrustedIssuerUpdateOutputSchema.parse({
        transactionHash,
        issuerAddress,
      });
    }
  );
