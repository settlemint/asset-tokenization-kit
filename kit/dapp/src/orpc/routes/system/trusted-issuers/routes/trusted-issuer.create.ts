/**
 * Trusted Issuer Creation Handler
 *
 * This handler creates new trusted issuers through the ATKTrustedIssuersRegistry contract.
 * Trusted issuers are entities authorized to issue claims about identities in the system.
 * Each issuer is assigned specific claim topics they are allowed to verify.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Executes the registration transaction via Portal GraphQL
 * 3. Returns transaction details and the issuer address
 *
 * @see {@link ./trusted-issuer.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  TrustedIssuerCreateOutputSchema,
  type TrustedIssuerCreateOutput,
} from "./trusted-issuer.create.schema";

/**
 * GraphQL mutation for creating a new trusted issuer
 * Calls the addTrustedIssuer function on the ATKTrustedIssuersRegistry contract
 */
const CREATE_TRUSTED_ISSUER_MUTATION = portalGraphql(`
  mutation CreateTrustedIssuerMutation(
    $address: String!
    $from: String!
    $trustedIssuer: String!
    $claimTopics: [String!]!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTrustedIssuersRegistryAddTrustedIssuer(
      address: $address
      from: $from
      input: {
        _trustedIssuer: $trustedIssuer
        _claimTopics: $claimTopics
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Create a new trusted issuer in the registry
 *
 * Registers a new trusted issuer that can verify identity claims for specific topics.
 * The issuer must have an identity contract deployed and can only verify the assigned topics.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The trusted issuer registration parameters
 * @param input.issuerAddress - Address of the issuer's identity contract
 * @param input.claimTopicIds - Array of topic IDs the issuer can verify
 * @returns Transaction hash and issuer address
 */
export const trustedIssuerCreate = systemRouter.system.trustedIssuerCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimPolicyManager", "systemModule"] },
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }): Promise<TrustedIssuerCreateOutput> => {
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

    // Execute the registration transaction
    const transactionHash = await context.portalClient.mutate(
      CREATE_TRUSTED_ISSUER_MUTATION,
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
    return TrustedIssuerCreateOutputSchema.parse({
      transactionHash,
      issuerAddress,
    });
  });