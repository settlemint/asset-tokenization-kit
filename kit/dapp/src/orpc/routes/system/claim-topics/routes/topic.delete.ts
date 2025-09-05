/**
 * Topic Scheme Removal Handler
 *
 * This handler removes an existing topic scheme from the ATKTopicSchemeRegistry contract.
 * Removing a topic scheme will prevent new claims from being issued for that topic,
 * but existing claims will remain valid. This is a destructive operation and should
 * be used with caution.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Generates the topic ID from the name for reference
 * 3. Executes the removal transaction via Portal GraphQL
 * 4. Returns transaction details and the removed topic information
 *
 * Note: System-reserved topics (ID 1-100) may have additional restrictions or
 * may not be removable depending on the contract implementation.
 *
 * @see {@link ./topic.delete.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
// No need to import SYSTEM_PERMISSIONS - using direct role requirements
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  TopicDeleteOutputSchema,
  type TopicDeleteOutput,
} from "./topic.delete.schema";

/**
 * GraphQL mutation for removing a topic scheme
 * Calls the removeTopicScheme function on the ATKTopicSchemeRegistry contract
 */
const REMOVE_TOPIC_SCHEME_MUTATION = portalGraphql(`
  mutation RemoveTopicSchemeMutation(
    $address: String!
    $from: String!
    $name: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTopicSchemeRegistryRemoveTopicScheme(
      address: $address
      from: $from
      input: {
        name: $name
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Remove a topic scheme from the registry
 *
 * Permanently removes a topic scheme from the registry. This prevents new claims
 * from being issued for this topic. Existing claims remain valid but new ones
 * cannot be created. This operation cannot be undone.
 *
 * Warning: Removing a topic that is actively used by trusted issuers may break
 * claim verification flows. Ensure the topic is no longer needed before removal.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The topic removal parameters
 * @param input.name - Name of the topic scheme to remove
 * @returns Transaction hash and removed topic information
 */
export const topicDelete = onboardedRouter.system.claimTopics.topicDelete
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.topicDelete,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }): Promise<TopicDeleteOutput> => {
    const { system } = context;
    const { name, walletVerification } = input;
    const sender = context.auth.user;

    // Validate system configuration
    const registryAddress = system?.topicSchemeRegistry;
    if (!registryAddress) {
      const cause = new Error(
        "Topic scheme registry not found in system configuration"
      );
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Execute the removal transaction
    const transactionHash = await context.portalClient.mutate(
      REMOVE_TOPIC_SCHEME_MUTATION,
      {
        address: registryAddress,
        from: sender.wallet,
        name,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return success response with transaction details
    return TopicDeleteOutputSchema.parse({
      transactionHash,
      name,
    });
  });
